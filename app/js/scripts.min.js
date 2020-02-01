' use strict ';

// ...........................Custom JS......................... //

window.onload = function () {
  const linkMatrix = document.getElementsByClassName('link-matrix');
  const linkTools = document.getElementsByClassName('link-tools');
  const div = document.querySelector('.draw');
  const clearCanvas = document.querySelector('.btn-clear');
  const paletteColors = document.querySelectorAll('span.palette-color');
  const chooseColor = document.getElementById('color');
  const currentColor = paletteColors[0];
  const prevColor = paletteColors[1];
  const loadImage = document.querySelector('.btn-load');
  const townRequest = document.querySelector('.town');
  // const grayScale = document.querySelector('.black-white');

  let myColor = 'black';
  let queryTown = townRequest.value;

  let active = document.querySelector('.active');
  let matrix = active.firstElementChild.getAttribute('matrix');

  let current = document.querySelector('.current');
  let { method } = current.dataset;

  // Function showFrame

  function showFrame() {
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
    div.insertAdjacentHTML('beforeend', '<canvas id="canvas" width="512" height="512"></canvas>');

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // closure - function frame

    function frame() {
      current = document.querySelector('.current');
      method = current.dataset.method;
    }

    // ..........................................................................

    frame.getLinkToImage = async function (town) {
      town = town || 'Moscow';         
      const url = `https://api.unsplash.com/photos/random?query=town,${town}&client_id=16425caa8556570be94b3ed5cc1c610731f62cc7d71f7eaa3537c54f13c5d37b`;
      const response = await fetch(url)
        .then((res) => res.json())
        .then((data) => data.urls.small);

      const image = new Image();
      image.src = response;

      function drawImageActualSize() {
        const sizeX = image.naturalWidth;
        const sizeY = image.naturalHeight;
        let ratio;

        console.log(sizeX, sizeY);

        image.width = Math.round(sizeX / matrix);
        image.height = Math.round(sizeY / matrix);

        console.log(this.width, this.height);

        if ((sizeX - sizeY) > 0) {
          ratio = canvas.width / image.width;
          ctx.drawImage(this,
            0, 0, this.width, this.height,
            0, (canvas.height - (this.height * ratio)) / 2, canvas.width, this.height * ratio);
        } else {
          ratio = canvas.height / image.height;
          ctx.drawImage(this,
            0, 0, this.width, this.height,
            (canvas.width - (this.width * ratio)) / 2, 0, this.width * ratio, canvas.height);
        }
      }
      image.onload = drawImageActualSize;
    };

    // ..........................................................................

    frame.fill = function () {
      ctx.fillStyle = myColor;
      ctx.fillRect(0, 0, 512, 512);
    };

    frame.eyedropper = function () {
      chooseColor.style.visibility = 'visible';

      chooseColor.oninput = function () {
        prevColor.style.backgroundColor = myColor;
        myColor = this.value;
        currentColor.style.backgroundColor = this.value;
      };
    };

    frame.draw = function (e) {
      if (!isDrawing) return; // stop the fn from running when they are not moused down

      chooseColor.oninput = function () {
        myColor = this.value;
      };

      ctx.strokeStyle = myColor;
      ctx.lineJoin = 'round'; // round || bevel || miter
      ctx.lineCap = 'round'; // round || butt || square
      ctx.lineWidth = matrix;

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    frame.checkTools = function () {
      function handle(e) {
        if (method === 'pencil') {
          isDrawing = true;
          [lastX, lastY] = [e.offsetX, e.offsetY];
          frame.draw(e);
        } else if (method === 'fill') {
          frame.fill();
        } else {
          canvas.removeEventListener('mousedown', handle);
        }
      }

      switch (method) {
        case 'fill':
          chooseColor.style.visibility = 'hidden';
          canvas.addEventListener('mousedown', handle);
          break;

        case 'eyedropper':
          this.eyedropper();
          break;

        case 'pencil':
          chooseColor.style.visibility = 'hidden';
          canvas.addEventListener('mousedown', handle);
          canvas.addEventListener('mousemove', this.draw);
          canvas.addEventListener('mouseup', () => isDrawing = false);
          canvas.addEventListener('mouseout', () => isDrawing = false);
          break;

        default:
          chooseColor.style.visibility = 'hidden';
          // alert(`method: ${method}`);
      }
    };

    frame.clear = function () {
      clearCanvas.onclick = function () {
        ctx.clearRect(0, 0, 512, 512); // clear canvas
      };
    };

    return frame;
  }

  // end showFrame

  // ...............................................................................................

  // run application

  const frame = showFrame();
  frame();
  frame.checkTools();
  frame.clear();

  loadImage.addEventListener('click', () => {    
    frame.getLinkToImage(queryTown);
  });

  townRequest.onchange = function () {
    queryTown = this.value;
    return queryTown;
  };

  Array.from(linkTools).forEach((toolsLink) => {
    toolsLink.addEventListener('click', function () {
      current.classList.remove('current');
      this.parentElement.classList.add('current');

      frame();
      frame.checkTools();
    });
  });

  Array.from(linkMatrix).forEach((matrixLink) => {
    matrixLink.addEventListener('click', function () {
      matrix = this.getAttribute('matrix');
      active = document.querySelector('.active');
      active.classList.remove('active');
      this.parentElement.classList.add('active');

      frame();
      frame.checkTools();
    });
  });
};