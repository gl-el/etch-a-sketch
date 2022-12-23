const BACKGROUND = "hsl(0, 0%, 85%)"; //цвет фон
//определяем размер одной стороны холста в пикселях
let sliderValue = 25;
let pixelSize = "";
let slider = document.getElementById("slider-range");
let sliderOutput = document.getElementById("slider-value");
slider.addEventListener("change", () => {
  sliderValue = slider.value;
  sliderOutput.innerHTML = `${sliderValue} x ${sliderValue}`;
  reloadCanvas();
});

//добавление пикселей на холст
const canvas = document.querySelector(".canvas");
function addPixel(size) {
  //считаем размер одного пикселя
  pixelSize = 100 / sliderValue;
  //запускаем добавление
  for (let i = 0; i < size ** 2; i++) {
    //создаем элемент
    const pixel = document.createElement("div");
    //добавляем ему класс
    pixel.classList.add("pixel");
    //добавляем ему размер
    pixel.style.flexBasis = `${pixelSize}%`;
    //добавляем в конец дочерних элементов элемента с классом canvas
    canvas.append(pixel);
  }
}
//первоначальное добавление пикселей на холст
addPixel(sliderValue);
//начальный цвет
let newColor = "hsl(43, 86%, 48%)";
//выбор цвета
const colorSelector = document.getElementById("color-pick");
colorSelector.addEventListener("change", (e) => {
  newColor = e.target.value;
});
colorSelector.addEventListener("click", () => {
  mode = "color";
  defStlBtn();
  const colorControl = document.querySelector('.color-control');
  colorControl.classList.add('active');
});

//слушаем состояние мыши
let mouseIsDown = "";
//лкм нажта
document.addEventListener("mousedown", () => {
  return (mouseIsDown = true);
});
//лкм отжата
document.addEventListener("mouseup", () => {
  return (mouseIsDown = false);
});
//переменная определяющая в каком режиме рисовать
let mode = "color";
//добавляем листенер на нахождение мыши над холстом
canvas.addEventListener("mouseover", (e) => {
  //проверка находится ли мышь над эдементом с классом pixel
  const isPixel = e.target.classList.contains("pixel");
  if (!isPixel) return;
  //смотрим конкретный пиксель на который указывает мышь
  const pixel = e.target;
  //проверяем состояние мыши,
  //если лкм зажата - в зависимости от режима меняем цвет фона
  if (mouseIsDown == true) {
    switch (mode) {
      case "color":
        pixel.style.background = `${newColor}`;
        break;
      case "random":
        pixel.style.background = getRandomColor();
        break;
      case "eraser":
        pixel.style.background = BACKGROUND;
        break;
      case "darker":
        pixel.style.background = dark(pixel);
        break;
      case "clear":
        pixel.style.background = BACKGROUND;
    }
  }
});

//очистка холста
function clearCanvas() {
  mode = "clear";
  //выбираем все пиксели
  const pixels = document.querySelectorAll(".pixel");
  //для каждого перекрашиваем фон
  pixels.forEach((pixel) => {
    pixel.style.backgroundColor = BACKGROUND;
  });
}
//кнопка вызывающая функцию очистки холста
const btnClear = document.getElementById("clear");
btnClear.addEventListener("click", () => {
  clearCanvas();
  defStlBtn()
  btnClear.classList.add('active');
});
//кнопка ластика, меняет режим рисования на режим стирания
const btnEraser = document.getElementById("eraser");
btnEraser.addEventListener("click", () => {
  mode = "eraser";
  defStlBtn()
  btnEraser.classList.add('active');
});
//перезагрузка холста: убираем все пиксели с холста, добавляем по новой
function reloadCanvas() {
  document.querySelectorAll(".pixel").forEach((pixel) => {
    pixel.remove();
  });
  addPixel(sliderValue);
}
//функция для получения случайного RGB цвета
function getRandomColor() {
  const R = Math.floor(Math.random() * 255);
  const G = Math.floor(Math.random() * 255);
  const B = Math.floor(Math.random() * 255);
  return `rgb(${R}, ${G}, ${B})`;
}
//кнопка переключает режим рисования в рисование случайным цветом
const btnRandomColor = document.getElementById("random");
btnRandomColor.addEventListener("click", () => {
  mode = "random";
  defStlBtn()
  btnRandomColor.classList.add('active');
});
//кнопка переключения режима в режим затемнения
const btnDarker = document.getElementById("darker");
btnDarker.addEventListener("click", () => {
mode = "darker";
defStlBtn()
btnDarker.classList.add('active');
});
let hue, sat, lum;
//функция преобразования из rgb в hsl
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b);
  let delta = cmax - cmin;
  //ссчитаем hue по формулам из википедии
  if (delta == 0) {
    hue = 0;
  } else {
    switch (cmax) {
      case r:
        hue = ((g - b) / delta) % 6;
        break;
      case g:
        hue = (b - r) / delta + 2;
        break;
      case b:
        hue = (r - g) / delta + 4;
        break;
    }
  }
  hue = Math.round(hue * 60);
  if (hue < 0) {
    hue += 360;
  }

  //считаем lum как среднее между максимальным и миимальным
  lum = (cmax + cmin) / 2;
  //cсчитаем sat
  sat = delta == 0 ? 0 : delta / (1 - Math.abs(2 * lum - 1));
  //и приводим к процентам
  lum = +(lum * 100).toFixed(1);
  sat = +(sat * 100).toFixed(1);
  // return "hsl(" + h + "," + s + "%," + lum + "%)";
}
//функция преобрзования hex в hsl
function hexToHsl(HEX) {
  //в ргб
  let r = 0;
  let g = 0;
  let b = 0;
  r = +("0x" + HEX[1] + HEX[2]);
  g = +("0x" + HEX[3] + HEX[4]);
  b = +("0x" + HEX[5] + HEX[6]);
  return rgbToHsl(r, g, b);
}
//делаем темнее
function dark(pixel) {
  //получаем цвет фона конкректного пикселя
  let color = window.getComputedStyle(pixel, null).backgroundColor;
  //достаем цифровый значения RGB
  let rgbColor = color.match(/\d+/g);
  //преобразуем в HSL
  rgbToHsl(rgbColor[0], rgbColor[1], rgbColor[2]);
  //понижаем яркость на 10%
  if (lum > 0) {
    lum = lum - 0.1 * lum;
  } else {
    lumTemp = 0;
  }
  return `hsl(${hue}, ${sat}%, ${lum}%)`;
}
//сброс фона кнопки
function defStlBtn() {
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button) => {
    button.classList.remove('active');
  });
  const colorControl = document.querySelector('.color-control')
  colorControl.classList.remove('active');
}
