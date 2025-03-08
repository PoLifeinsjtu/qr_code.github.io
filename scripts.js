// script.js
document.addEventListener('DOMContentLoaded', () => {
    let currentQR = null;
    let logoImage = null;
    let currentConfig = {
        fgColor: '#000000',
        bgColor: '#ffffff',
        logo: null
    };

    // 切换输入类型
    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.input-group').forEach(el => el.style.display = 'none');
            document.getElementById(`${this.value}-input`).style.display = 'block';
        });
    });

    // 生成二维码
    document.getElementById('generate-btn').addEventListener('click', generateQRCode);

    // 美化面板切换
    document.getElementById('enhance-btn').addEventListener('click', () => {
        document.querySelector('.enhance-panel').classList.toggle('active');
    });

    // 颜色选择
    document.querySelectorAll('.color-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.color-box').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentConfig.fgColor = getComputedStyle(this).backgroundColor;
            updateQRCode();
        });
    });

    // 自定义颜色
    document.getElementById('foreground-color').addEventListener('input', function() {
        currentConfig.fgColor = this.value;
        updateQRCode();
    });

    document.getElementById('background-color').addEventListener('input', function() {
        currentConfig.bgColor = this.value;
        updateQRCode();
    });

    // LOGO上传
    document.getElementById('logo-upload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                logoImage = new Image();
                logoImage.src = event.target.result;
                logoImage.onload = () => {
                    document.getElementById('logo-preview').style.backgroundImage = `url(${event.target.result})`;
                };
            };
            reader.readAsDataURL(file);
        }
    });

    // 保存二维码
    document.getElementById('save-btn').addEventListener('click', saveQRCode);

    function generateQRCode() {
        const type = document.querySelector('input[name="type"]:checked').value;
        let content = '';

        switch(type) {
            case 'text':
                content = document.getElementById('text-content').value.trim();
                break;
            case 'image':
                const file = document.getElementById('image-upload').files[0];
                if (!file) return alert('请选择图片文件');
                content = URL.createObjectURL(file);
                break;
            case 'url':
                content = document.getElementById('url-content').value.trim();
                if (!content) return alert('请输入网址');
                if (!/^https?:\/\//i.test(content)) content = `https://${content}`;
                break;
        }

        createQRCard(content);
    }

    function createQRCard(content) {
        const card = document.createElement('div');
        card.className = 'qr-card';
        
        const qrDiv = document.createElement('div');
        currentQR = new QRCode(qrDiv, {
            text: content,
            width: 180,
            height: 180,
            colorDark: currentConfig.fgColor,
            colorLight: currentConfig.bgColor,
            correctLevel: QRCode.CorrectLevel.Q
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.addEventListener('click', () => card.remove());

        card.appendChild(deleteBtn);
        card.appendChild(qrDiv);
        document.getElementById('qrcode-container').prepend(card);
    }

    function updateQRCode() {
        if (!currentQR) return;
        currentQR._htOption.colorDark = currentConfig.fgColor;
        currentQR._htOption.colorLight = currentConfig.bgColor;
        currentQR.makeCode(currentQR._htOption.text);
    }

    function saveQRCode() {
        if (!currentQR) return alert('请先生成二维码');
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 500;
        canvas.width = size;
        canvas.height = size;

        // 绘制二维码
        const qrImg = currentQR._el.querySelector('img');
        ctx.drawImage(qrImg, 0, 0, size, size);

        // 添加LOGO
        if (logoImage) {
            const logoSize = size * 0.2;
            ctx.drawImage(logoImage, 
                (size - logoSize)/2, 
                (size - logoSize)/2,
                logoSize,
                logoSize
            );
        }

        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'qr_code.png';
        link.href = canvas.toDataURL();
        link.click();
    }
});
