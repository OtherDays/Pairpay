window.addEventListener('DOMContentLoaded', () => {

    // [1] 캔버스 초기화
    const canvas = new fabric.Canvas('pairCanvas', {
        backgroundColor: '#D2D2D2',
        preserveObjectStacking: true,
        enableRetinaScaling: true, // 고해상도 디스플레이 대응 활성화
        imageSmoothingEnabled: false // 텍스트와 이미지 선명도 향상
    });

    // ==========================================
    // 'alphabetical' -> 'alphabetic' 오타 보정 패치
    // ==========================================
    if (fabric && fabric.Text) {
        fabric.Text.prototype._getBaselineOffset = function() {
            if (this.textBaseline === 'alphabetical') {
                this.textBaseline = 'alphabetic'; 
            }
            return 0; 
        };
    }

    // [2] 공통 잠금 및 스타일 옵션
    const lockOptions = {
        originX: 'center', originY: 'center',
        lockMovementX: true, lockMovementY: true,
        lockScalingX: true, lockScalingY: true,
        lockRotation: true,
        hasControls: false, selectable: true,
        strokeUniform: true 
    };

    const textOptions = {
        ...lockOptions,
        fontFamily: 'Sweet', textAlign: 'center',
        fontSize: 16, fill: '#333333', splitByGrapheme: true,
        backgroundColor: 'transparent'
    };

    // ==========================================
    // 0 & 1. 둥근 전체 배경판 + 상단 요소 배치
    // ==========================================
    
    // 네 모서리가 24px로 부드럽게 깎인 전체 배경판
    const canvasBackground = new fabric.Rect({
        left: 800, top: 450, width: 1600, height: 900,
        rx: 24, ry: 24, 
        fill: '#D2D2D2', ...lockOptions, name: 'canvas-bg-rect'
    });
    canvas.add(canvasBackground);
    canvas.setBackgroundColor('transparent', canvas.renderAll.bind(canvas));

    // ==========================================
    // 2. 텍스트 박스 통합 제어 및 생성 함수
    // ==========================================
    function createTextBox(left, top, width, height, defaultText, alignX, alignY, isTitle = false) {
        const centerX = Math.floor(left + width / 2);
        const centerY = Math.floor(top + height / 2);
        const boxFillColor = isTitle ? 'transparent' : 'rgba(102, 102, 102, 0.3)';

        const bgRect = new fabric.Rect({
            left: centerX, top: centerY, width: width, height: height,
            rx: 12, ry: 12, 
            selectable: false,
            fill: boxFillColor, ...lockOptions, name: 'text-box-bg'
        });
        
        const currentTextOptions = {
            ...lockOptions,
            fill: '#333333', 
            backgroundColor: 'transparent', width: width - 30, textAlign: alignX
        };

        if (isTitle) {
            currentTextOptions.fontFamily = 'Paperozi'; 
            currentTextOptions.lineHeight = 1.1; 
            currentTextOptions.fontSize = 18; 
            currentTextOptions.name = 'title-textbox'; 
        } else {
            currentTextOptions.fontFamily = 'Sweet'; 
            currentTextOptions.lineHeight = 1.0;  
            currentTextOptions.fontSize = 16; 
            currentTextOptions.name = 'normal-textbox';
        }

        if (alignY === 'center') {
            currentTextOptions.originX = 'center'; currentTextOptions.originY = 'center';
            currentTextOptions.left = centerX; currentTextOptions.top = centerY;
        } else if (alignY === 'top') {
            currentTextOptions.originY = 'top';
            currentTextOptions.top = top + 15; 
            if (alignX === 'left') {
                currentTextOptions.originX = 'left'; currentTextOptions.left = left + 15;
            } else if (alignX === 'right') {
                currentTextOptions.originX = 'right'; currentTextOptions.left = left + width - 15;
            }
        }

        const textBox = new fabric.Textbox(defaultText, currentTextOptions);
        textBox.name = isTitle ? 'title-textbox' : 'normal-textbox';

        canvas.add(bgRect);
        canvas.add(textBox);

        applyDynamicFonts(textBox);
    }

    // [전체 텍스트 박스 레이아웃 배치]
    createTextBox(20, 25, 430, 60, '이름 (줄바꿈 1회까지 가능)', 'left', 'center', true);      
    createTextBox(1150, 25, 430, 60, '일본어 폰트를 지원합니다!', 'right', 'center', true);   
    
    createTextBox(310, 170, 220, 160, '이름, 성별, 연령, 소속 등', 'left', 'top');  
    createTextBox(1070, 170, 220, 160, '기본적인 정보 공간.', 'right', 'top'); 
    
    createTextBox(310, 350, 220, 180, '외관 정보가 들어가면', 'left', 'top'); 
    createTextBox(1070, 350, 220, 180, '적당할 것 같은 공간!', 'right', 'top');
    createTextBox(310, 680, 220, 200, '성격이나 기타 특징 공간.', 'left', 'top');
    createTextBox(1070, 680, 220, 200, '해시태그도 쓸 수 있어요.', 'right', 'top');
    
    createTextBox(550, 680, 500, 80, '왼쪽 캐릭터 한마디.', 'center', 'center');
    createTextBox(550, 800, 500, 80, '오른쪽 캐릭터 한마디.', 'center', 'center');


    // ==========================================
    // 3. 포인트 작은 사각형 칩들
    // ==========================================
    for(let i=0; i<4; i++) {
        canvas.add(new fabric.Rect({ left: (310 + 16) + (i * 40), top: 115 + 17.5, width: 30, height: 35, rx: 8, ry: 8, fill: '#EEEEEE', ...lockOptions, name: 'point-yellow' }));
        canvas.add(new fabric.Rect({ left: (1070 + 86) + (i * 40), top: 115 + 17.5, width: 30, height: 35, rx: 8, ry: 8, fill: '#EEEEEE', ...lockOptions, name: 'point-yellow' }));
    }


    // ==========================================
    // 4. 특수 영역 및 스탯 대칭/정렬 보정 구조
    // ==========================================
    const specialAreaLeft = new fabric.Rect({ left: 310 + 110, top: 550 + 55, width: 220, height: 110, rx: 12, ry: 12, fill: 'rgba(102, 102, 102, 0.1)', ...lockOptions, name: 'special-mint' });
    const specialAreaRight = new fabric.Rect({ left: 1070 + 110, top: 550 + 55, width: 220, height: 110, rx: 12, ry: 12, fill: 'rgba(102, 102, 102, 0.1)', ...lockOptions, name: 'special-mint' });
    canvas.add(specialAreaLeft, specialAreaRight);

    let statRegistry = { left: {}, right: {} };

    function buildFiveStatRows(startBoxX, startBoxY, side) {
        const rowHeight = 17; 
        const padTop = 15;    

        for (let i = 0; i < 5; i++) {
            const currentY = startBoxY + padTop + (i * rowHeight);
            statRegistry[side][i] = [];

            if (side === 'left') {
                const statNameText = new fabric.Textbox(`스테이터스 ${i+1}`, {
                    left: startBoxX + 15, top: currentY, width: 85,
                    ...textOptions, textAlign: 'left', fontSize: 14, originX: 'left', originY: 'top'
                });
                canvas.add(statNameText);

                for (let d = 0; d < 5; d++) {
                    const dot = new fabric.Circle({ left: (startBoxX + 115) + (d * 18), top: currentY + 7, radius: 5.5, fill: '#333333', ...lockOptions });
                    canvas.add(dot); statRegistry[side][i].push(dot);
                }
            } else {
                const rightDotStartX = startBoxX + 35; 
                for (let d = 0; d < 5; d++) {
                    const dot = new fabric.Circle({ left: rightDotStartX + (d * 18), top: currentY + 7, radius: 5.5, fill: '#333333', ...lockOptions });
                    canvas.add(dot); statRegistry[side][i].push(dot);
                }

                const statNameText = new fabric.Textbox(`스테이터스 ${i+1}`, {
                    left: startBoxX + 220 - 15, top: currentY, width: 85,
                    ...textOptions, textAlign: 'right', fontSize: 14, originX: 'right', originY: 'top'
                });
                canvas.add(statNameText);
            }
        }
    }
    buildFiveStatRows(310, 550, 'left');
    buildFiveStatRows(1070, 550, 'right');


    // ==========================================
    // 5. 이미지 슬롯 및 출처(커미션) 표기 영역
    // ==========================================
    
    // 1. 상단 정중앙 이미지 박스 생성
    const headerCenterImgSlot = new fabric.Rect({
        left: 800, top: 55, width: 600, height: 90,
        rx: 12, ry: 12, fill: '#EAEAEA', ...lockOptions, name: 'header-image-slot'
    });
    canvas.add(headerCenterImgSlot);

    // slotsData는 아래 forEach 루프보다 먼저 선언되어야 합니다.
    const slotsData = [
        { name: 'image-slot', left: 20 + 135, top: 115 + 107.5, width: 270, height: 215 },   // 좌측 상단
        { name: 'image-slot', left: 20 + 135, top: 350 + 265, width: 270, height: 530 },    // 좌측 하단
        { name: 'image-slot', left: 1310 + 135, top: 115 + 107.5, width: 270, height: 215 }, // 우측 상단
        { name: 'image-slot', left: 1310 + 135, top: 350 + 265, width: 270, height: 530 },  // 우측 하단
        { name: 'image-slot', left: 550 + 250, top: 115 + 272.5, width: 500, height: 545 }   // 중앙 대형
    ];

    // 출처 표기용 전용 텍스트 옵션
    const creditTextOptions = {
        ...lockOptions,
        fontFamily: 'Sweet',
        fontSize: 12,
        fill: 'rgba(51, 51, 51, 0.6)', 
        textAlign: 'center',
        backgroundColor: 'transparent',
        splitByGrapheme: true,
        name: 'credit-textbox' 
    };

    // 2. 일반 이미지 슬롯 5개 및 출처 칸 생성 루프
    slotsData.forEach(data => {
        const slotRect = new fabric.Rect({
            left: data.left, top: data.top, width: data.width, height: data.height,
            rx: 12, ry: 12, fill: '#EAEAEA', ...lockOptions, name: data.name
        });
        canvas.add(slotRect);

        const creditTop = data.top + (data.height / 2) - 14; 
        const creditBox = new fabric.Textbox('ⓒ commission', {
            ...creditTextOptions,
            left: data.left,
            top: creditTop,
            width: data.width - 20
        });
        canvas.add(creditBox);
        applyDynamicFonts(creditBox); 
    });

    // 3. 상단 정중앙 이미지 박스 전용 출처 칸 생성
    const headerCreditBox = new fabric.Textbox('ⓒ commission', {
        ...creditTextOptions,
        left: 800,
        top: 55 + (90 / 2) - 14,
        width: 600 - 20
    });
    canvas.add(headerCreditBox);
    applyDynamicFonts(headerCreditBox);


    // ==========================================
    // 5-B. 관계성 표시용 위아래 독립 화살표 세트
    // ==========================================
    const arrowBaseColor = '#999999';
    const arrowCenterY = 780; // 중앙 입력 1과 2 사이 여백의 중간 위치

    const rightHeadLeft = 205; 
    const leftHeadLeft = -205; 

    // --- [1] 위쪽 화살표 (오른쪽 방향 고정 ➔) ---
    const topLine = new fabric.Line([-200, 0, 200, 0], { stroke: arrowBaseColor, strokeWidth: 7, strokeLineCap: 'round', originX: 'center', originY: 'center' });
    const topHeadR = new fabric.Path('M 0 0 L -16 -10 L -16 10 Z', {
        left: rightHeadLeft, top: 0,
        fill: arrowBaseColor,
        stroke: arrowBaseColor,
        strokeWidth: 5, // 모서리를 둥글게 처리하기 위한 두께
        strokeLineJoin: 'round', // 꼭짓점을 둥글게 처리
        strokeLineCap: 'round',
        originX: 'center', originY: 'center', name: 'head-r'
    });

    const arrowTop = new fabric.Group([topLine, topHeadR], {
        left: 800, top: arrowCenterY - 20,
        ...lockOptions, selectable: true, name: 'arrow-top'
    });

    // --- [2] 아래쪽 화살표 (왼쪽 방향 고정 ↵) ---
    const bottomLine = new fabric.Line([-200, 0, 200, 0], { stroke: arrowBaseColor, strokeWidth: 7, strokeLineCap: 'round', originX: 'center', originY: 'center' });
    const bottomHeadL = new fabric.Path('M 0 0 L 16 -10 L 16 10 Z', {
        left: leftHeadLeft, top: 0,
        fill: arrowBaseColor,
        stroke: arrowBaseColor,
        strokeWidth: 5, // 모서리를 둥글게 처리하기 위한 두께
        strokeLineJoin: 'round', // 꼭짓점을 둥글게 처리
        strokeLineCap: 'round',
        originX: 'center', originY: 'center', name: 'head-l'
    });
    const arrowBottom = new fabric.Group([bottomLine, bottomHeadL], {
        left: 800, top: arrowCenterY + 20,
        ...lockOptions, selectable: true, name: 'arrow-bottom'
    });

    [arrowTop, arrowBottom].forEach(arrow => {
        arrow.lockScalingX = true; arrow.lockScalingY = true; arrow.hasControls = true;
    });

    canvas.add(arrowTop);
    canvas.add(arrowBottom);


    // ==========================================
    // 6. 컬러 칩 클릭 시 컬러 피커 작동 로직
    // ==========================================
    const pickerContainer = document.getElementById('pickerContainer');
    
    // Vanilla-Picker 초기화
    const picker = new Picker({
        parent: pickerContainer, 
        popup: false, 
        alpha: false,
        onChange: function(color) {
            const activeObject = canvas.getActiveObject();
            if (activeObject && activeObject.name === 'point-yellow') {
                activeObject.set('fill', color.hex.substring(0, 7)); 
                canvas.renderAll();
            }
        },
        // 피커 하단의 OK(Done) 버튼을 누르면 호출되는 함수
        onDone: function(color) {
            pickerContainer.style.display = 'none'; // 피커 창 숨김
            canvas.discardActiveObject(); // 선택된 컬러칩의 테두리 해제
            canvas.renderAll();
        }
    });

    // 캔버스 마우스 클릭 리스너
    canvas.on('mouse:down', function(options) {
        const activeObject = canvas.getActiveObject();
        
        // 컬러칩('point-yellow')을 누른 경우에만 피커를 띄웁니다.
        if (activeObject && activeObject.name === 'point-yellow') {
            const e = options.e;
            
            pickerContainer.style.left = (e.clientX + 10) + 'px'; 
            pickerContainer.style.top = (e.clientY + 10) + 'px';
            pickerContainer.style.display = 'block'; 
            
            picker.setColor(activeObject.fill, true);
        } else { 
            // 피커 내부 조작 시에는 유지하고, 다른 주요 슬롯을 새로 클릭했을 때만 닫습니다.
            if (options.target && (
                options.target.name === 'image-slot' || 
                options.target.name === 'header-image-slot' || 
                options.target.name === 'arrow-top' || 
                options.target.name === 'arrow-bottom'
            )) {
                pickerContainer.style.display = 'none'; 
            }
        }
    });


    // ==========================================
    // 7. 이미지 슬롯 파일 업로드 로직
    // ==========================================
    const imageUploader = document.getElementById('imageUploader');
    let selectedSlot = null;

    canvas.on('mouse:down', function(options) {
        const activeObject = canvas.getActiveObject();
        if (activeObject && (activeObject.name === 'image-slot' || activeObject.name === 'header-image-slot')) { selectedSlot = activeObject; imageUploader.click(); }
    });

    imageUploader.addEventListener('change', function(e) {
        const file = e.target.files[0]; if (!file || !selectedSlot) return;
        const reader = new FileReader();
        reader.onload = function(f) {
            fabric.Image.fromURL(f.target.result, function(img) {
                img.scaleToWidth(selectedSlot.width);
                img.set({ left: selectedSlot.left, top: selectedSlot.top, originX: 'center', originY: 'center', hasRotatingPoint: true });
                const clipMask = new fabric.Rect({ left: selectedSlot.left, top: selectedSlot.top, width: selectedSlot.width, height: selectedSlot.height, rx: selectedSlot.rx, ry: selectedSlot.ry, originX: 'center', originY: 'center', absolutePositioned: true });
                img.clipPath = clipMask; canvas.add(img);

                selectedSlot.set('fill', 'transparent');

                img.moveTo(canvas.getObjects().indexOf(selectedSlot) + 1); canvas.setActiveObject(img); canvas.renderAll();
            });
        };
        reader.readAsDataURL(file); e.target.value = '';
    });


    // ==========================================
    // 8. 하단 메뉴판 제어 기능 연동
    // ==========================================
    document.getElementById('bgControl').addEventListener('input', function(e) {
        const bgRect = canvas.getObjects().find(obj => obj.name === 'canvas-bg-rect');
        if (bgRect) { bgRect.set('fill', e.target.value); canvas.renderAll(); }
    });

    document.getElementById('headerControl').addEventListener('input', function(e) {});

    function updateGroupOutline(targetName, colorValue, widthValue) {
        const thickness = Number(widthValue);
        canvas.getObjects().forEach(obj => {
            if (obj.name === targetName || (Array.isArray(targetName) && targetName.includes(obj.name))) {
                obj.set({ stroke: thickness > 0 ? colorValue : null, strokeWidth: thickness });
            }
        });
        canvas.renderAll();
    }

    // Hex 색상을 RGBA 알파 60%로 변환하는 함수
    function hexToRgba60(hex) {
        let c = hex.substring(1);
        if (c.length === 3) {
            c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
        }
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, 0.6)`; // 알파값 60% 고정 리턴
    }

    const imgColor = document.getElementById('imgStrokeColor'); const imgWidth = document.getElementById('imgStrokeWidth');
    imgColor.addEventListener('input', () => updateGroupOutline('image-slot', imgColor.value, imgWidth.value));
    imgWidth.addEventListener('input', () => updateGroupOutline('image-slot', imgColor.value, imgWidth.value));

    const chipColor = document.getElementById('chipStrokeColor'); const chipWidth = document.getElementById('chipStrokeWidth');
    chipColor.addEventListener('input', () => updateGroupOutline('point-yellow', chipColor.value, chipWidth.value));
    chipWidth.addEventListener('input', () => updateGroupOutline('point-yellow', chipColor.value, chipWidth.value));

    const textColor = document.getElementById('textStrokeColor'); 
    const textWidth = document.getElementById('textStrokeWidth');

    function updateTextOutline() {
        const thickness = Number(textWidth.value);
        const colorValue = textColor.value;

        canvas.getObjects().forEach(obj => {
            if (obj.name === 'special-mint' || obj.name === 'text-box-bg') {
                if (obj.name === 'text-box-bg' && obj.top < 70) { // 타이틀 영역(top < 70)은 테두리 적용 예외
                    obj.set({ stroke: null, strokeWidth: 0 });
                } else {
                    obj.set({ stroke: thickness > 0 ? colorValue : null, strokeWidth: thickness });
                }
            }
        });
        canvas.renderAll();
    }

    textColor.addEventListener('input', updateTextOutline);
    textWidth.addEventListener('input', updateTextOutline);

    document.getElementById('arrowTopColor').addEventListener('input', function(e) {
        const arrowGroup = canvas.getObjects().find(obj => obj.name === 'arrow-top');
        if (arrowGroup) {
            arrowGroup.forEachObject(obj => {
                if (obj.stroke) obj.set('stroke', e.target.value);
                if (obj.fill) obj.set('fill', e.target.value);
            });
            canvas.renderAll();
        }
    });

    document.getElementById('arrowBottomColor').addEventListener('input', function(e) {
        const arrowGroup = canvas.getObjects().find(obj => obj.name === 'arrow-bottom');
        if (arrowGroup) {
            arrowGroup.forEachObject(obj => {
                if (obj.stroke) obj.set('stroke', e.target.value);
                if (obj.fill) obj.set('fill', e.target.value);
            });
            canvas.renderAll();
        }
    });

    document.getElementById('fontColorControl').addEventListener('input', function(e) {
        const newColor = e.target.value;
        const creditColor = hexToRgba60(newColor); // 선택된 색상의 60% 농도 계산

        canvas.getObjects().forEach(obj => {
            // [A] 일반 텍스트 박스들 색상 변경
            if (obj.name === 'title-textbox' || obj.name === 'normal-textbox') {
                obj.set('fill', newColor);
                if (obj.styles) {
                    Object.keys(obj.styles).forEach(lineKey => {
                        Object.keys(obj.styles[lineKey]).forEach(charKey => {
                            obj.styles[lineKey][charKey].fill = newColor;
                        });
                    });
                }
            }
            
            // [B] 출처 표기 텍스트 박스 색상 동기화 (60% 농도)
            if (obj.name === 'credit-textbox') {
                obj.set('fill', creditColor);
                if (obj.styles) {
                    Object.keys(obj.styles).forEach(lineKey => {
                        Object.keys(obj.styles[lineKey]).forEach(charKey => {
                            obj.styles[lineKey][charKey].fill = creditColor;
                        });
                    });
                }
            }
        });

        filledColor = newColor; 
        if (typeof statRegistry !== 'undefined') {
            ['left', 'right'].forEach(side => {
                for (let i = 0; i < 5; i++) {
                    const slider = document.getElementById(`${side}-slider-${i}`);
                    if (slider) { refreshDots(side, i, Number(slider.value)); }
                }
            });
        }
        canvas.renderAll();
    });
    
    function refreshAllTextFonts() {
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'textbox' || (obj.name && obj.name.includes('textbox'))) {
                applyDynamicFonts(obj);
            }
        });
    }

    document.getElementById('leftTagColorControl').addEventListener('input', refreshAllTextFonts);
    document.getElementById('rightTagColorControl').addEventListener('input', refreshAllTextFonts);


    // ==========================================
    // 9. 스탯 슬라이더 동적 동기화
    // ==========================================
    let filledColor = '#334155'; 
    const emptyColor = 'transparent';

    function refreshDots(side, rowIndex, value) {
        const targetDots = statRegistry[side][rowIndex];
        if (!targetDots) return;
        targetDots.forEach((dot, index) => {
            if (side === 'left') { dot.set('fill', index < value ? filledColor : emptyColor); } 
            else { dot.set('fill', (4 - index) < value ? filledColor : emptyColor); }
        });
        canvas.renderAll();
    }

    function injectStatSliders(containerId, side) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = ''; 
        for (let i = 0; i < 5; i++) {
            const row = document.createElement('div'); row.className = 'stat-slider-row';
            const initialVal = (i % 2 === 0) ? 4 : 3;
            row.innerHTML = `<span>스테이터스 ${i+1}</span><input type="range" id="${side}-slider-${i}" min="0" max="5" value="${initialVal}">`;
            container.appendChild(row);
            
            const inputElement = document.getElementById(`${side}-slider-${i}`);
            inputElement.addEventListener('input', (e) => refreshDots(side, i, Number(e.target.value)));
            refreshDots(side, i, initialVal);
        }
    }
    injectStatSliders('leftStatSliders', 'left'); 
    injectStatSliders('rightStatSliders', 'right');


    // ==========================================
    // 10. 실시간 다국어 폰트 & 해시태그 칩 스타일 맵핑 함수
    // ==========================================
    function applyDynamicFonts(textbox) {
        if (!textbox || !textbox.name) return; 
        
        const text = textbox.text || '';
        textbox.styles = {}; 

        const jpRegex = /[\u3040-\u309F\u30A0-\u30FF\uFF00-\uFFEF\u4E00-\u9FBF\u3400-\u4DBF]/;
        const lines = text.split('\n');
        
        let hashtagMap = {};
        lines.forEach((line, lineIdx) => {
            hashtagMap[lineIdx] = [];
            const regex = /#[^\s]+/g;
            let match;
            while ((match = regex.exec(line)) !== null) {
                const start = match.index;
                const end = start + match[0].length;
                for (let i = start; i < end; i++) { hashtagMap[lineIdx].push(i); }
            }
        });

        let lineIndex = 0;
        lines.forEach((line) => {
            textbox.styles[lineIndex] = {};
            
            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const isHashtag = hashtagMap[lineIndex] && hashtagMap[lineIndex].includes(i);
                
                let charStyle = { fill: textbox.fill || filledColor };

                if (textbox.name === 'title-textbox') {
                    charStyle.fontFamily = jpRegex.test(char) ? 'Hachi Maru Pop' : 'paperozi';
                    charStyle.deltaY = 4; // Y축 오프셋 보정
                } else {
                    charStyle.fontFamily = jpRegex.test(char) ? 'Sans-serif' : 'Sweet';
                    
                    if (isHashtag) {
                        charStyle.fontSize = 14;
                        charStyle.fontWeight = 'bold';
                        
                        // HTML 피커 엘리먼트가 존재하면 그 값을, 로딩 전이면 기본값 #EEEEEE를 적용합니다.
                        const leftPicker = document.getElementById('leftTagColorControl');
                        const rightPicker = document.getElementById('rightTagColorControl');
                        const leftTagColor = leftPicker ? leftPicker.value : '#EEEEEE';
                        const rightTagColor = rightPicker ? rightPicker.value : '#EEEEEE';

                        if (textbox.left < 800) {
                            charStyle.textBackgroundColor = leftTagColor; 
                        } else {
                            charStyle.textBackgroundColor = rightTagColor; 
                        }
                    }
                }
                textbox.styles[lineIndex][i] = charStyle;
            }
            lineIndex++;
        });
        canvas.renderAll();
    }

    canvas.on('text:changed', function(e) {
        if (e.target && e.target.type === 'textbox') { applyDynamicFonts(e.target); }
    });

    canvas.setWidth(1600); canvas.setHeight(900); canvas.renderAll();


    // ==========================================
    // 11. 완성된 캔버스 이미지(PNG)로 다운로드 기능
    // ==========================================
    if (document.getElementById('saveCanvasBtn')) {
        document.getElementById('saveCanvasBtn').addEventListener('click', function() {
            canvas.discardActiveObject();
            canvas.requestRenderAll();

            setTimeout(() => {
                try {
                    const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 1 });
                    const downloadLink = document.createElement('a');
                    downloadLink.href = dataURL;
                    downloadLink.download = 'pairpay_' + new Date().toISOString().slice(0,10) + '.png';
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                } catch (error) {
                    console.error("저장 중 에러 발생:", error);
                }
            }, 100);
        });
    }

    // ==========================================
    // 12. 웹 폰트 명시적 로드 후 캐시 파괴 및 자동 새로고침
    // ==========================================
    if (document.fonts) {
        Promise.all([
            document.fonts.load('18px "Paperozi"'),
            document.fonts.load('16px "Sweet"'),
            document.fonts.load('16px "Hachi Maru Pop"')
        ]).then(() => {
            canvas.getObjects().forEach(obj => {
                if (obj.type === 'textbox' || (obj.name && obj.name.includes('textbox'))) {
                    obj.initDimensions(); 
                    obj.set('dirty', true); 
                    applyDynamicFonts(obj); 
                }
            });
            canvas.requestRenderAll();
        }).catch(err => {
            console.error("폰트 로딩 중 에러 발생:", err);
        });
    }

});
