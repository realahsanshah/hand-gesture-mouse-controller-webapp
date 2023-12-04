export const LABEL_TO_COLOR = {
    lips: '#E0E0E0',
    leftEye: '#30FF30',
    leftEyebrow: '#30FF30',
    leftIris: '#30FF30',
    rightEye: '#FF3030',
    rightEyebrow: '#FF3030',
    rightIris: '#FF3030',
    faceOval: '#E0E0E0',
};
const FINGER_LOOKUP_INDICES: any = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
};


export const drawHands = (hands: any, ctx: any, cursorRef: any, showNames = false) => {
    if (hands.length <= 0) { return; }

    hands.sort((hand1: any, hand2: any) => {
        if (hand1.handedness < hand2.handedness) return 1;
        if (hand1.handedness > hand2.handedness) return -1;
        return 0;
    });

    // while (hands.length < 2) { hands.push(); }

    for (let i = 0; i < hands.length; i++) {
        ctx.fillStyle = hands[i].handedness === 'Left' ? 'black' : 'Blue';
        ctx.strokeStyle = 'White';
        ctx.lineWidth = 2;

        for (let y = 0; y < hands[i].keypoints.length; y++) {
            const keypoint = hands[i].keypoints[y];
            ctx.beginPath();
            ctx.arc(
                keypoint.x,
                keypoint.y,
                4,
                0,
                2 * Math.PI
            );
            ctx.fill();

            if (showNames) {
                drawInvertedText(keypoint, ctx);
            }
        }

        const fingers = Object.keys(FINGER_LOOKUP_INDICES);
        for (let z = 0; z < fingers.length; z++) {
            const finger = fingers[z];
            const points = FINGER_LOOKUP_INDICES[finger].map((idx: any) => hands[i].keypoints[idx]);

            drawPath(points, ctx);
        }
        // console.log(hands[i]);
        // if thumb and index finger are close, console.log('click'), only once
        if (hands[i].keypoints[4].x - hands[i].keypoints[8].x < 2) {
            console.log('click');
        }

        // move mouse to index finger
        if (hands[i].keypoints[8].x > 0) {
            console.log('move mouse');
            // move mouse to specific position
            cursorRef.current.style.left = `${hands[i].keypoints[8].x}px`;
            cursorRef.current.style.top = `${hands[i].keypoints[8].y}px`;


        }


    }
}


const drawInvertedText = (keypoint: any, ctx: any) => {
    ctx.save();
    ctx.translate(keypoint.x - 10, keypoint.y);
    ctx.rotate(-Math.PI / 1);
    ctx.scale(1, -1);
    ctx.fillText(keypoint.name, 0, 0);
    ctx.restore();
}

const drawPath = (points: any, ctx: any, closePath = false) => {
    const region = new Path2D();
    region.moveTo(points[0]?.x, points[0]?.y);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point?.x, point?.y);
    }

    if (closePath) { region.closePath(); }

    ctx.stroke(region);
}