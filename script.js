// save
// 점수 2인이 확인하기

let lastImagePosition = null;
let score = 0;
let images = [];
let imageElements = [null, null, null];
let isImageChanged = [false,false,false];

function toggleMode() {
    const body = document.body;
    const modeToggle = document.getElementById('modeToggle');
    const isDarkMode = body.classList.contains('dark-mode');

    // Toggle the class based on the current mode
    if (isDarkMode) {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        modeToggle.innerHTML = '☀️'; // Switch to moon emoji for light mode
        saveModePreference('light');
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        modeToggle.innerHTML = '🌙'; // Switch to sun emoji for dark mode
        saveModePreference('dark');
    }
}

// Function to save user's mode preference to local storage
function saveModePreference(mode) {
    localStorage.setItem('modePreference', mode);
}

// Function to retrieve user's mode preference from local storage on page load
function retrieveModePreference() {
    const savedMode = localStorage.getItem('modePreference');
    if (savedMode) {
        document.body.classList.add(savedMode + '-mode');
        document.getElementById('modeToggle').innerHTML = savedMode === 'dark' ? '☀️' : '🌙';
    }
}

function saveGameState() {
    const gameState = {
        isImageChanged: isImageChanged,
        score: score,
        lastSaveTime: new Date().getTime()
    };

    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
        const gameState = JSON.parse(savedState);

        // Check if the saved state is from a previous day
        const lastSaveDate = new Date(gameState.lastSaveTime);
        const currentDate = new Date();

        if (!isSameDay(lastSaveDate, currentDate)) {
            // If it's a new day, reset the images
            console.log("New day detected. Resetting images.");
            resetImages();
        } else {
            // If it's the same day, load the saved state
            console.log("Same day. Loading saved state.");
            isImageChanged = gameState.isImageChanged;
            score = gameState.score;
        }
    } else {
        // If there's no saved state, initialize with default values
        console.log("No saved state found. Initializing with default values.");
        isImageChanged = [false, false, false];
        score = 0;
    }

    updateScore();
    applyImageStates();
}

function resetGameState() {
    score = 0;
    isImageChanged = [false, false, false];
    updateScore();
    applyImageStates();
    saveGameState();
}

function applyImageStates() {
    isImageChanged.forEach((changed, index) => {
        if (changed && imageElements[index]) {
            imageElements[index].classList.add('falling-image-blink');
        } else if (imageElements[index]) {
            imageElements[index].classList.remove('falling-image-blink');
        }
    });
}

function setInitialImage() {
    const imageContainer = document.getElementById('topRightImage');
    imageContainer.style.position = 'relative';

    for (let i = 0; i < 3; i++) {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'top-right-image falling-image';

        imgDiv.style.position = 'fixed';
        imgDiv.style.right = `${10 + i * 20}px`;
        imgDiv.style.top = '10px';
        imgDiv.style.width = '16px';
        imgDiv.style.height = '16px';
        imageContainer.appendChild(imgDiv);
        imageElements[i] = imgDiv;
    }
}

function setScore() {
    const imageContainer = document.getElementById('topRightImage');
    imageContainer.style.position = 'relative';

    const imgDiv = document.createElement('div');
    imgDiv.className = 'score';
    imgDiv.id = 'headImage';

    imgDiv.style.position = 'fixed';
    imgDiv.style.top = '34px';
    imgDiv.style.width = '16px';
    imgDiv.style.height = '16px';
    imageContainer.appendChild(imgDiv);

    const scoreDiv = document.createElement('div');
    scoreDiv.id = 'scoreDisplay';
    scoreDiv.style.position = 'fixed';
    scoreDiv.style.right = '10px';
    scoreDiv.style.top = '30px';
    scoreDiv.style.fontSize = '16px';
    scoreDiv.style.fontWeight = 'bold';
    scoreDiv.style.color = 'white';
    //scoreDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // 배경
    //scoreDiv.style.padding = '5px 10px'; // 패딩
    //scoreDiv.style.borderRadius = '5px'; // 모서리 둥글게
    //scoreDiv.style.zIndex = '1000'; // 화면 위쪽으로

    scoreDiv.style.fontFamily = "'Galmuri9', sans-serif";

    document.body.appendChild(scoreDiv);
}

function increaseScore(amount) {
    score += amount;
    updateScore();
    saveGameState();
}

function updateScore() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const headImage = document.getElementById('headImage');

    if (scoreDisplay && headImage) {
        scoreDisplay.textContent = `${score}`;

        const scoreWidth = scoreDisplay.offsetWidth;
        const newRightPosition = 10 + scoreWidth + 10; // 20px(원래 간격) + 점수 너비 + 10px(추가 간격)
        headImage.style.right = `${newRightPosition}px`;
    }
}

function changeImage(index) {
    if (index < 0 || index >= imageElements.length) {
        return;
    }

    if (imageElements[index]) {
        imageElements[index].classList.add('falling-image-blink');
        isImageChanged[index] = true;
        increaseScore(1);
        saveGameState();
    }
}

function resetImages() {
    isImageChanged = [false, false, false];
    applyImageStates();
    saveGameState();
}

function getNextResetTime() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
}

function scheduleNextReset() {
    const now = new Date().getTime();
    const nextReset = getNextResetTime();
    const timeUntilReset = nextReset - now;

    setTimeout(() => {
        resetImages();
        scheduleNextReset(); // Schedule the next reset
    }, timeUntilReset);
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

function createImageAtPosition(x, y) {
    const img = document.createElement('img');
    img.className = 'falling-image';
    img.style.transition = 'top 0.5s ease-in';
    img.style.left = `${x}px`;
    img.style.top = `${y - window.innerHeight}px`;

    document.body.appendChild(img);

    const imageObj = { img, x, y , active: true, fading: false};
    images.push(imageObj);

    requestAnimationFrame(() => {
        img.style.top = `${y}px`;
    });

    lastImagePosition = { x, y };

    setTimeout(() => {
        imageObj.fading = true;
        img.style.transition = 'all 1s ease-out';
        img.style.transform = 'translateY(-10px)';
        img.style.opacity = '0';
    }, 4000);

    setTimeout(() => {
        imageObj.active = false;
        img.remove();
    }, 5000);
}

function checkImageDogCollision(dogX, dogY) {
    const threshold = 48;
    let collisionOccurred = 0;

    for (let i = images.length - 1; i >= 0; i--) {
        const image = images[i];
        if (!image.active || image.fading) continue;

        const dx = Math.abs(dogX - image.x);
        const dy = Math.abs(dogY - image.y);

        if (dx < threshold && dy < threshold) {
            image.active = false;
            image.img.remove();
            collisionOccurred++;

            for (let j = 0; j < 3; j++) {
                if (!isImageChanged[j]) {
                    changeImage(j);
                    break;
                }
            }
        }

        if (collisionOccurred) {
            for (let j = 0; j < 3; j++) {
                setTimeout(() => {
                    createHeartOrStar(dogX, dogY);
                }, j * 300);
            }
        }
        break;
    }
    images = images.filter(img => img.active);
    return collisionOccurred;
}

function handleBodyClick(e) {
    if (!e.target.closest('.dog')) {
        createImageAtPosition(e.clientX, e.clientY);
        moveDog();
    }
}

function getRandomPosition(x, y, range) {
    const randomX = x + (Math.random() - 0.5) * range * 2;
    const randomY = y + (Math.random() - 0.5) * range * 2;
    return { x: randomX, y: randomY };
}

function createHeartOrStar(x, y){
    const range = 30;
    const { x: randomX, y: randomY } = getRandomPosition(x, y, range);

    const element = document.createElement('div');

    if (Math.random() < 0.01) {
        element.className = 'star-image';
    } else {
        element.className = 'heart-image';
    }

    element.style.left = `${randomX - 10}px`;
    element.style.top = `${randomY - 10}px`;
    document.body.appendChild(element);

    setTimeout(() => {
        element.classList.add('fade-out');
    }, 1000);
    setTimeout(() => {
        element.remove();
    }, 2000);
}

function init() {

    topRightImage = document.getElementById('topRightImage');
    setInitialImage();
    setScore();

    loadGameState();

    saveGameState();

    scheduleNextReset();

    const elements = {
        body: document.querySelector('.wrapper'),
        wrapper: document.querySelector('.wrapper'),
        dog: document.querySelector('.dog'),
        marker: document.querySelectorAll('.marker'),
        // indicator: document.querySelector('.indicator'),
    }

    const animationFrames = {
        rotate: [[0], [1], [2], [3], [5], [3, 'f'], [2, 'f'], [1, 'f']]
    }

    const directionConversions = {
        360: 'up',
        45: 'upright',
        90: 'right',
        135: 'downright',
        180: 'down',
        225: 'downleft',
        270: 'left',
        315: 'upleft',
    }

    const angles = [360, 45, 90, 135, 180, 225, 270, 315]
    const defaultEnd = 4

    const partPositions = [
        { //0 뒷면
            leg1: { x: 31, y: 55, z: 1, rotation: 10 },
            leg2: { x: 49, y: 58, z: 1, rotation: -10 },
            leg3: { x: 31, y: 43, z: 2, rotation: 25 },
            leg4: { x: 49, y: 47, z: 2, rotation: 335 },
        },
        { //1 뒷면 우측
            leg1: { x: 28, y: 51, z: 1, rotation: 25 },
            leg2: { x: 42, y: 51, z: 1, rotation: 25 },
            leg3: { x: 26, y: 41, z: 1, rotation: 65 },
            leg4: { x: 40, y: 41, z: 1, rotation: 65 },
        },
        { //2 우측
            leg1: { x: 30, y: 55, z: -1, rotation: 15 },
            leg2: { x: 30, y: 50, z: -2, rotation: 30 },
            leg3: { x: 25, y: 45, z: -1, rotation: 60 },
            leg4: { x: 25, y: 40, z: -2, rotation: 75 },
        },
        { //3 정면 우측
            leg1: { x: 32, y: 56, z: -1, rotation: 25 },
            leg2: { x: 46, y: 56, z: -2, rotation: 10 },
            leg3: { x: 28, y: 46, z: -1, rotation: 45 },
            leg4: { x: 42, y: 46, z: -2, rotation: 30 },
        },
        { //4 정면
            leg1: { x: 33, y: 54, z: -1, rotation: 10 },
            leg2: { x: 46, y: 57, z: -1, rotation: -10 },
            leg3: { x: 27, y: 43, z: -2, rotation: 25 },
            leg4: { x: 52, y: 51, z: -2, rotation: 335},
        },
        { //5 정면 좌측
            leg1: { x: 32, y: 60, z: -2, rotation: 350 },
            leg2: { x: 46, y: 60, z: -1, rotation: 335 },
            leg3: { x: 42, y: 50, z: -2, rotation: 330 },
            leg4: { x: 56, y: 50, z: -1, rotation: 315 },
        },
        { //6 좌측
            leg1: { x: 50, y: 63, z: -1, rotation: 335 },
            leg2: { x: 50, y: 58, z: -2, rotation: 330 },
            leg3: { x: 65, y: 55, z: -1, rotation: 300 },
            leg4: { x: 65, y: 50, z: -2, rotation: 285 },
        },
        { //7 뒷면 좌측
            leg1: { x: 42, y: 59, z: 2, rotation: 335  },
            leg2: { x: 56, y: 55, z: 1, rotation: 335  },
            leg3: { x: 50, y: 56, z: 2, rotation: 295  },
            leg4: { x: 64, y: 56, z: 1, rotation: 295  },
        },
    ]

    const control = {
        x: null,
        y: null,
        angle: null,
    }

    const distance = 30
    const nearestN = (x, n) => x === 0 ? 0 : (x - 1) + Math.abs(((x - 1) % n) - n)
    const px = num => `${num}px`
    const radToDeg = rad => Math.round(rad * (180 / Math.PI))
    const degToRad = deg => deg / (180 / Math.PI)
    const overlap = (a, b) =>{
        const buffer = 20
        return Math.abs(a - b) < buffer
    }

    const rotateCoord = ({ angle, origin, x, y }) =>{
        const a = degToRad(angle)
        const aX = x - origin.x
        const aY = y - origin.y
        return {
            x: (aX * Math.cos(a)) - (aY * Math.sin(a)) + origin.x,
            y: (aX * Math.sin(a)) + (aY * Math.cos(a)) + origin.y,
        }
    }

    const setStyles = ({ target, h, w, x, y, rotation }) =>{
        if (h) target.style.height = h
        if (w) target.style.width = w
        let transform = `translate(${x || 0}, ${y || 0})`

        if (rotation !== undefined) {
            transform += ` rotate(${rotation}deg)`
        }
        target.style.transform = transform
    }

    const targetAngle = dog =>{
        if (!dog) return
        const angle = radToDeg(Math.atan2(dog.pos.y - lastImagePosition.y, dog.pos.x - lastImagePosition.x)) - 90
        const adjustedAngle = angle < 0 ? angle + 360 : angle
        return nearestN(adjustedAngle, 45)
    }

    const reachedTheGoalYeah = (x, y) =>{
        return overlap(lastImagePosition.x , x) && overlap(lastImagePosition.y, y)
    }

    const positionLegs = (dog, frame) => {
        ;[5, 7, 9, 11].forEach((n, i) => {
            const { x, y, z, rotation } = partPositions[frame][`leg${i + 1}`]
            const legElement = dog.childNodes[n]
            setStyles({
                target: legElement,
                x: px(x),
                y: px(y),
                rotation: rotation
            })
            legElement.style.zIndex = z;
        })
    }

    const moveLegs = dog => {
        ;[5, 11].forEach(i => dog.childNodes[i].childNodes[1].classList.add('walk-1'))
        ;[7, 9].forEach(i => dog.childNodes[i].childNodes[1].classList.add('walk-2'))
    }

    const stopLegs = dog => {
        ;[5, 11].forEach(i => dog.childNodes[i].childNodes[1].classList.remove('walk-1'))
        ;[7, 9].forEach(i => dog.childNodes[i].childNodes[1].classList.remove('walk-2'))
    }

    const animateDog = ({ target, frameW, currentFrame, end, data, part, speed, direction }) => {
        const offset = direction === 'clockwise' ? 1 : -1

        target.style.transform = `translateX(${px(data.animation[currentFrame][0] * -frameW)})`
        if (part === 'body') {
            positionLegs(data.dog, currentFrame)
            moveLegs(data.dog)
        } else {
            target.parentNode.classList.add('happy')
        }
        data.angle = angles[currentFrame]
        data.index = currentFrame

        target.parentNode.classList[data.animation[currentFrame][1] === 'f' ? 'add' : 'remove']('flip')

        let nextFrame = currentFrame + offset
        nextFrame = nextFrame === -1
            ? data.animation.length - 1
            : nextFrame === data.animation.length
                ? 0
                : nextFrame
        if (currentFrame !== end) {
            data.timer[part] = setTimeout(()=> animateDog({
                target, data, part, frameW,
                currentFrame: nextFrame, end, direction,
                speed,
            }), speed || 150)
        } else if (part === 'body') {
            // end
            lastImagePosition.angle = angles[end]
            data.walk = true
            setTimeout(()=> {
                stopLegs(data.dog)
            }, 200)
            setTimeout(()=> {
                document.querySelector('.happy')?.classList.remove('happy')
            }, 1000)
        }
    }

    const triggerDogAnimation = ({ target, frameW, start, end, data, speed, part, direction }) => {
        clearTimeout(data.timer[part])
        data.timer[part] = setTimeout(()=> animateDog({
            target, data, part, frameW,
            currentFrame: start, end, direction,
            speed,
        }), speed || 150)
    }

    const getDirection = ({ pos, facing, target }) =>{
        const dx2 = facing.x - pos.x
        const dy1 = pos.y - target.y
        const dx1 = target.x - pos.x
        const dy2 = pos.y - facing.y

        return dx2 * dy1 > dx1 * dy2 ? 'anti-clockwise' : 'clockwise'
    }

    const turnDog = ({ dog, start, end, direction }) => {
        triggerDogAnimation({
            target: dog.dog.childNodes[3].childNodes[1],
            frameW: 31 * 2,
            start, end,
            data: dog,
            speed: 100,
            direction,
            part: 'head'
        })

        setTimeout(()=>{
            triggerDogAnimation({
                target: dog.dog.childNodes[1].childNodes[1],
                frameW: 48 * 2,
                start, end,
                data: dog,
                speed: 100,
                direction,
                part: 'body'
            })
        }, 100)
    }

    const createDog = () => {
        const { dog } = elements
        const { width, height, left, top } = dog.getBoundingClientRect()
        dog.style.left = px(left)
        dog.style.top = px(top)
        dog.style.position = 'absolute'

        const bodyParts = Array.from(dog.children)
        bodyParts.forEach(part => {
            part.style.position = 'absolute'
            if (part.classList.contains('head')) {
                part.style.zIndex = 2  // head의 z-index를 높게 설정
            } else {
                part.style.zIndex = 1  // body의 z-index를 중간으로 설정
            }
        })

        positionLegs(dog, 0)
        const index = 0

        const dogData = {
            timer: {
                head: null, body: null, all: null,
            },
            pos: {
                x: left + (width / 2),
                y: top + (height / 2),
            },
            actualPos: {
                x: left,
                y: top,
            },
            facing: {
                x: left + (width / 2),
                y: top + (height / 2) + 30,
            },
            animation: animationFrames.rotate,
            angle: 360,
            index,
            dog,
        }
        elements.dog = dogData

        turnDog({
            dog: dogData,
            start: index, end: defaultEnd,
            direction: 'clockwise'
        })

        positionLegs(dog, 0);

        dog.addEventListener('click', (event) => {
            event.stopPropagation();
            createHeartOrStar(event.clientX, event.clientY);
        });
    }

    const checkBoundaryAndUpdateDogPos = (x, y, dog, dogData) =>{
        const lowerLimit = -40 // buffer from window edge
        const upperLimit = 40
        if (x > lowerLimit && x < (elements.body.clientWidth - upperLimit)){
            dogData.pos.x = x + 48
            dogData.actualPos.x = x
        }
        if (y > lowerLimit && y < (elements.body.clientHeight - upperLimit)){
            dogData.pos.y = y + 48
            dogData.actualPos.y = y
        }
        dog.style.left = px(x)
        dog.style.top = px(y)
    }

    const positionMarker = (i, pos) => {
        elements.marker[i].style.left = px(pos.x)
        elements.marker[i].style.top = px(pos.y)
    }

    const moveDog = () =>{
        clearInterval(elements.dog.timer.all)
        const { dog } = elements.dog

        elements.dog.timer.all = setInterval(()=> {
            const { left, top } = dog.getBoundingClientRect()
            const start = angles.indexOf(elements.dog.angle)
            const end = angles.indexOf(targetAngle(elements.dog))

            const dogCenterX = left + 48;
            const dogCenterY = top + 48;

            checkImageDogCollision(dogCenterX, dogCenterY)


            if (reachedTheGoalYeah(left + 48, top + 48)) {
                clearInterval(elements.dog.timer.all)
                const { x, y } = elements.dog.actualPos
                dog.style.left = px(x)
                dog.style.top = px(y)
                stopLegs(dog)
                turnDog({
                    dog: elements.dog,
                    start,
                    end: defaultEnd,
                    direction: 'clockwise'
                })
                return
            }

            let { x, y } = elements.dog.actualPos
            const dir = directionConversions[targetAngle(elements.dog)]
            if (dir !== 'up' && dir !== 'down') x += (dir.includes('left')) ? -distance : distance
            if (dir !== 'left' && dir !== 'right') y += (dir.includes('up')) ? -distance : distance

            positionMarker(0, elements.dog.pos)
            positionMarker(1, lastImagePosition)

            const { x: x2, y: y2 } = rotateCoord({
                angle: elements.dog.angle,
                origin: elements.dog.pos,
                x: elements.dog.pos.x,
                y: elements.dog.pos.y - 100,
            })
            elements.dog.facing.x = x2
            elements.dog.facing.y = y2
            positionMarker(2, elements.dog.facing)

            if (start === end) {
                elements.dog.turning = false
            }

            if (!elements.dog.turning && elements.dog.walk) {
                if (start !== end) {
                    elements.dog.turning = true

                    const direction = getDirection({
                        pos: elements.dog.pos,
                        facing: elements.dog.facing,
                        target: lastImagePosition,
                    })
                    turnDog({
                        dog: elements.dog,
                        start, end, direction,
                    })
                } else {
                    checkBoundaryAndUpdateDogPos(x, y, dog, elements.dog)
                    moveLegs(dog)
                }
            }
        }, 200)
    }

    //createDog()

    function handleBodyClick(e) {
        createImageAtPosition(e.clientX, e.clientY);
        triggerTurnDog();
    }

    const triggerTurnDog = () => {
        const dog = elements.dog
        dog.walk = false
        lastImagePosition.angle = null

        const direction = getDirection({
            pos: dog.pos,
            facing: dog.facing,
            target: lastImagePosition,
        })

        const start = angles.indexOf(dog.angle)
        const end = angles.indexOf(targetAngle(dog))
        turnDog({
            dog,
            start, end, direction
        })
    }

    elements.body.addEventListener('click', moveDog)
    elements.body.addEventListener('click', handleBodyClick);

    createDog();
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'r' || event.key === 'R') {
        resetGameState();
    }
});

window.addEventListener('DOMContentLoaded', init)