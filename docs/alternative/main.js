title = "alternative";
description = ``;
characters = [];
const BAR_LENGTH = 6;
options = {
    isPlayingBgm: true,
    isReplayEnabled: true,
    theme: "dark",
};
let players = [];
let isPressing;
let arrowAngle;
let arrowDirection;
let deathCube;
let pointCubes;
function createPointCube() {
    const size = rnd(5, 25);
    const xy = rnd(size, 100 - size);
    let cube;
    if (rnd() < 0.5) {
        if (rnd() < 0.5) {
            cube = { position: vec(100 + size, xy), angle: -PI };
        }
        else {
            cube = { position: vec(0 - size, xy), angle: 0 };
        }
    }
    else {
        if (rnd() < 0.5) {
            cube = {
                position: vec(xy, 100 + size),
                angle: -0.5 * PI,
            };
        }
        else {
            cube = { position: vec(xy, 0 - size), angle: 0.5 * PI };
        }
    }
    return { ...cube, size, dead: false };
}
function update() {
    if (!ticks) {
        players = [{ position: vec(0, 55), angle: 0 }];
        deathCube = {
            position: vec(60, 50),
            angle: -PI,
        };
        arrowAngle = 0;
        difficulty = 0;
        pointCubes = [];
        arrowDirection = true;
    }
    if (pointCubes.length < 4) {
        pointCubes.push(createPointCube());
    }
    color("green");
    remove(pointCubes, (c) => {
        if (c.dead)
            return true;
        c.position.add(vec(0.05, 0).rotate(c.angle));
        const collision = rect(c.position, c.size);
        if (collision.isColliding.rect.red) {
            c.dead = true;
            addScore(25 - c.size);
        }
    });
    if (input.isJustPressed) {
        arrowAngle = 0;
        arrowDirection = true;
    }
    if (input.isPressed) {
        arrowAngle += arrowDirection ? 0.04 : -0.04;
        if (arrowAngle <= 0)
            arrowDirection = true;
        if (arrowAngle > PI)
            arrowDirection = false;
    }
    if (input.isJustReleased && ticks > 10) {
        players = players.flatMap((p) => [
            { position: vec(p.position), angle: p.angle + arrowAngle },
            { position: vec(p.position), angle: p.angle - arrowAngle },
        ]);
    }
    color("red");
    deathCube.position.add(vec(0.01, 0).rotate(deathCube.angle));
    if (deathCube.position.x > 60) {
        deathCube.angle = PI;
    }
    if (deathCube.position.x < 40) {
        deathCube.angle = 0;
    }
    const deathCollision = rect(deathCube.position, 10);
    if (deathCollision.isColliding.rect.green) {
        end();
    }
    const speed = (1.0 + players.length * 0.2) * 0.1;
    remove(players, (p) => {
        if (p.position.x < 0 ||
            p.position.x > 100 ||
            p.position.y < 0 ||
            p.position.y > 100) {
            return true;
        }
        p.position.add(vec(speed, 0).rotate(p.angle));
        color("black");
        bar(p.position, 2, 1, p.angle);
        const collision = rect(p.position, 1);
        if (collision.isColliding.rect.red) {
            end();
        }
        if (collision.isColliding.rect.green) {
            pointCubes.forEach((c) => {
                if (Math.abs(c.position.x - p.position.x) < c.size &&
                    Math.abs(c.position.y - p.position.y) < c.size) {
                    c.dead = true;
                    addScore(25 - c.size);
                }
            });
            return true; // プレイヤーも削除
        }
        const barCenter = vec(1, 0).rotate(p.angle).add(p.position);
        const arrowStart1 = vec(BAR_LENGTH / 2, 0)
            .rotate(p.angle + arrowAngle)
            .add(barCenter);
        const arrowStart2 = vec(BAR_LENGTH / 2, 0)
            .rotate(p.angle - arrowAngle)
            .add(barCenter);
        if (input.isPressed) {
            color("light_cyan");
            bar(arrowStart1, BAR_LENGTH, 1, p.angle + arrowAngle);
            bar(arrowStart2, BAR_LENGTH, 1, p.angle - arrowAngle);
            color("blue");
            arc(p.position, BAR_LENGTH, 1, p.angle - arrowAngle, p.angle + arrowAngle);
        }
    });
    if (players.length == 0) {
        end();
    }
}
