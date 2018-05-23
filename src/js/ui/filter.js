import snippet from 'tui-code-snippet';
import Colorpicker from './colorpicker';
import Range from './range';
import filterHtml from '../template/submenu/filter';

const FILTER_OPTIONS = [
    'grayscale',
    'invert',
    'sepia',
    'sepia2',
    'blur',
    'sharpen',
    'emboss',
    'remove-white',
    'gradient-transparency',
    'brightness',
    'noise',
    'pixelate',
    'color-filter',
    'tint',
    'multiply',
    'blend'
];

export default class Filter {
    constructor(subMenuElement) {
        const selector = str => subMenuElement.querySelector(str);
        this.checkedMap = {};
        this.selector = selector;
        this._makeSubMenuElement(subMenuElement);
        this._el = {
            removewhiteThresholdRange: new Range(selector('#removewhite-threshold-range'), {
                min: 0,
                max: 255,
                value: 60
            }),
            removewhiteDistanceRange: new Range(selector('#removewhite-distance-range'), {
                min: 0,
                max: 255,
                value: 10
            }),

            gradientTransparencyRange: new Range(selector('#gradient-transparency-range'), {
                min: 0,
                max: 255,
                value: 100
            }),
            brightnessRange: new Range(selector('#brightness-range'), {
                min: -255,
                max: 255,
                value: 100
            }),
            noiseRange: new Range(selector('#noise-range'), {
                min: 0,
                max: 1000,
                value: 100
            }),
            pixelateRange: new Range(selector('#pixelate-range'), {
                min: 2,
                max: 20,
                value: 4
            }),
            colorfilterThresholeRange: new Range(selector('#colorfilter-threshole-range'), {
                min: 0,
                max: 255,
                value: 45
            }),
            filterTintColor: new Colorpicker(selector('#filter-tint-color'), '#03bd9e'),
            filterMultiplyColor: new Colorpicker(selector('#filter-multiply-color'), '#515ce6'),
            filterBlendColor: new Colorpicker(selector('#filter-blend-color'), '#ffbb3b')
        };
        this._el.tintOpacity = this._pickerWithRange(this._el.filterTintColor.pickerControl);
        this._el.blendType = this._pickerWithSelectbox(this._el.filterBlendColor.pickerControl);
    }

    _makeSubMenuElement(subMenuElement) {
        const filterSubMenu = document.createElement('div');
        filterSubMenu.className = 'filter';
        filterSubMenu.innerHTML = filterHtml;

        subMenuElement.appendChild(filterSubMenu);
    }

    _pickerWithRange(pickerControl) {
        const rangeWrap = document.createElement('div');
        const rangelabel = document.createElement('label');
        const range = document.createElement('div');

        range.id = 'filter-tint-opacity';
        range.title = 'Opacity';
        rangeWrap.appendChild(rangelabel);
        rangeWrap.appendChild(range);
        pickerControl.appendChild(rangeWrap);
        pickerControl.style.height = '130px';

        return new Range(range, {
            min: 0,
            max: 1,
            value: 0.7
        });
    }

    _pickerWithSelectbox(pickerControl) {
        const selectlistWrap = document.createElement('div');
        const selectlist = document.createElement('select');

        selectlistWrap.className = 'tui-image-editor-selectlist-wrap';
        selectlistWrap.appendChild(selectlist);

        this.getSelectOptionList(selectlist);

        pickerControl.appendChild(selectlistWrap);
        pickerControl.style.height = '130px';

        return selectlist;
    }

    getSelectOptionList(selectlist) {
        const blendOptions = ['add', 'diff', 'subtract', 'multiply', 'screen', 'lighten', 'darken'];
        snippet.forEach(blendOptions, option => {
            const selectOption = document.createElement('option');
            selectOption.setAttribute('value', option);
            selectOption.innerHTML = option.replace(/^[a-z]/, $0 => $0.toUpperCase());
            selectlist.appendChild(selectOption);
        });
    }

    toCamelCase(targetId) {
        return targetId.replace(/-([a-z])/g, ($0, $1) => $1.toUpperCase());
    }

    getFilterOption(type) {
        let option = null;
        switch (type) {
            case 'removeWhite':
                option = {
                    threshold: parseInt(this._el.removewhiteThresholdRange.getValue(), 10),
                    distance: parseInt(this._el.removewhiteDistanceRange.getValue(), 10)
                };
                break;
            case 'gradientTransparency':
                option = {
                    threshold: parseInt(this._el.gradientTransparencyRange.getValue(), 10)
                };
                break;
            case 'colorFilter':
                option = {
                    color: '#FFFFFF',
                    threshold: this._el.colorfilterThresholeRange.getValue()
                };
                break;
            case 'pixelate':
                option = {
                    blocksize: parseInt(this._el.pixelateRange.getValue(), 10)
                };
                break;
            case 'noise':
                option = {
                    noise: parseInt(this._el.noiseRange.getValue(), 10)
                };
                break;
            case 'brightness':
                option = {
                    brightness: parseInt(this._el.brightnessRange.getValue(), 10)
                };
                break;
            case 'blend':
                option = {
                    color: this._el.filterBlendColor.getColor(),
                    mode: this._el.blendType.value
                };
                break;
            case 'multiply':
                option = {
                    color: this._el.filterMultiplyColor.getColor()
                };
                break;
            case 'tint':
                option = {
                    color: this._el.filterTintColor.getColor(),
                    opacity: this._el.tintOpacity.getValue()
                };
                break;
            default:
                option = null;
                break;
        }

        return option;
    }

    addEvent({applyFilter}) {
        const changeRangeValue = filterName => {
            const apply = this.checkedMap[filterName].checked;
            const type = filterName;

            applyFilter(apply, type, this.getFilterOption(type));
        };

        snippet.forEach(FILTER_OPTIONS, filterName => {
            const filterCheckElement = this.selector(`#${filterName}`);
            const filterNameCamelCase = this.toCamelCase(filterName);

            this.checkedMap[filterNameCamelCase] = filterCheckElement;

            filterCheckElement.addEventListener('change', () => changeRangeValue(filterNameCamelCase));
        });

        this._el.removewhiteThresholdRange.on('change', () => changeRangeValue('removeWhite'));
        this._el.removewhiteDistanceRange.on('change', () => changeRangeValue('removeWhite'));
        this._el.gradientTransparencyRange.on('change', () => changeRangeValue('gradientTransparency'));
        this._el.colorfilterThresholeRange.on('change', () => changeRangeValue('colorFilter'));
        this._el.pixelateRange.on('change', () => changeRangeValue('pixelate'));
        this._el.noiseRange.on('change', () => changeRangeValue('noise'));
        this._el.brightnessRange.on('change', () => changeRangeValue('brightness'));
        this._el.blendType.addEventListener('change', () => changeRangeValue('blend'));
        this._el.filterBlendColor.on('change', () => changeRangeValue('blend'));
        this._el.filterMultiplyColor.on('change', () => changeRangeValue('multiply'));
        this._el.tintOpacity.on('change', () => changeRangeValue('tint'));
        this._el.filterTintColor.on('change', () => changeRangeValue('tint'));
        this._el.blendType.addEventListener('click', event => {
            event.stopPropagation();
        });
    }
}
