"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const IsAndroid = react_native_1.Platform.OS === "android";
const ScreenHeight = react_native_1.Dimensions.get("window").height;
const KEYBOARD_SHOW = IsAndroid ? "keyboardDidShow" : "keyboardWillShow";
const KEYBOARD_HIDE = IsAndroid ? "keyboardDidHide" : "keyboardWillHide";
const DEFAULT_EXTRA_HEIGHT = 20;
const KeyboardAvoidView = (props) => {
    const { extraHeight } = props;
    const [keyboardHeight, setKeyboardHeight] = react_1.useState(0); // 键盘高度
    const footerHeight = react_1.useRef(0); // 底部视图高度，Android 底部视图弹起的情况下需要计算
    const height = react_1.useRef(0); // 键盘高度
    const isShow = react_1.useRef(false); // 键盘是否显示
    const scrollView = react_1.useRef(null);
    const scrollY = react_1.useRef(0); // 记录 ScrollView y轴滚动的位置
    const scrollToFocusedInput = react_1.useCallback((bottomY) => {
        const keyboardTopY = ScreenHeight - height.current; // 键盘最顶部的 y 轴坐标值
        const offset = Math.ceil(bottomY - keyboardTopY);
        const triggerHeight = extraHeight + footerHeight.current; // 触发滚动修复的偏移距离
        // console.log('offset', offset, triggerHeight);
        if (offset > -triggerHeight) {
            const y = scrollY.current + offset + triggerHeight;
            scrollView?.current?.scrollTo({ x: 0, y, animated: true });
        }
    }, [extraHeight]);
    /** [x, y, width, height, pageX, pageY] */
    const measureCallback = react_1.useCallback((...args) => {
        // console.log('measure', args);
        // 输入框底部坐标 = 顶部坐标 pageY + 输入框高度 height, Android需要两倍高度
        const bottomY = args[5] + args[3] * (IsAndroid ? 2 : 1);
        scrollToFocusedInput(bottomY);
    }, [scrollToFocusedInput]);
    /**
     * ios 隐藏键盘的时候也会触发keyboardWillShow事件
     * 这里限制只有从隐藏状态到显示的时候才触发
     */
    const onShow = react_1.useCallback((event) => {
        // console.log('onShow', event);
        if (isShow.current)
            return;
        isShow.current = true;
        height.current = event.endCoordinates.height;
        setKeyboardHeight(event.endCoordinates.height);
        const input = react_native_1.TextInput.State.currentlyFocusedInput();
        input?.measure?.(measureCallback);
    }, [measureCallback]);
    const onHide = react_1.useCallback((event) => {
        // console.log('onHide', event);
        isShow.current = false;
        setKeyboardHeight(0);
    }, []);
    react_1.useEffect(() => {
        const showEvent = react_native_1.Keyboard.addListener(KEYBOARD_SHOW, onShow);
        const hideEvent = react_native_1.Keyboard.addListener(KEYBOARD_HIDE, onHide);
        return () => {
            showEvent.remove();
            hideEvent.remove();
        };
    }, [onShow, onHide]);
    const onScroll = react_1.useCallback((event) => {
        // console.log('onScroll', event.nativeEvent);
        scrollY.current = event.nativeEvent.contentOffset.y;
    }, []);
    const onLayout = react_1.useCallback((event) => {
        footerHeight.current = IsAndroid ? event.nativeEvent.layout.height : 0;
    }, []);
    return (<react_native_1.View style={styles.container}>
      <react_native_1.ScrollView style={[styles.container, props.style]} contentContainerStyle={[styles.content, props.contentContainerStyle]} ref={scrollView} onScroll={onScroll} scrollEventThrottle={16} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        {props.children}
        <react_native_1.View style={{ height: keyboardHeight }}></react_native_1.View>
      </react_native_1.ScrollView>
      <react_native_1.View onLayout={onLayout}>{props.footer}</react_native_1.View>
    </react_native_1.View>);
};
KeyboardAvoidView.defaultProps = {
    extraHeight: DEFAULT_EXTRA_HEIGHT,
};
exports.default = react_1.memo(KeyboardAvoidView);
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingBottom: 50,
    },
});
