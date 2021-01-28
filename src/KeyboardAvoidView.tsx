import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  ScrollViewProps,
  TextInput,
  Keyboard,
  KeyboardEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  LayoutChangeEvent,
  Platform,
  Dimensions,
} from "react-native";

const IsAndroid = Platform.OS === "android";
const ScreenHeight = Dimensions.get("window").height;
const KEYBOARD_SHOW = IsAndroid ? "keyboardDidShow" : "keyboardWillShow";
const KEYBOARD_HIDE = IsAndroid ? "keyboardDidHide" : "keyboardWillHide";
const DEFAULT_EXTRA_HEIGHT = 20;

type KeyboardAvoidViewProps = {
  /** 输入框底部 距离 键盘顶部的高度，默认为 20 */
  extraHeight?: number;
  /**
   * 底部固定视图
   * Android 由于底部固定视图会弹起，所以弹起的高度需要加上这个视图的高度
   * */
  footer?: React.ReactNode;
  /** 包含输入框的视图 */
  children?: React.ReactNode;
} & Pick<ScrollViewProps, "style" | "contentContainerStyle">;

const KeyboardAvoidView: React.FC<KeyboardAvoidViewProps> = (props) => {
  const { extraHeight } = props;
  const [keyboardHeight, setKeyboardHeight] = useState(0); // 键盘高度
  const footerHeight = useRef(0); // 底部视图高度，Android 底部视图弹起的情况下需要计算
  const height = useRef(0); // 键盘高度
  const isShow = useRef(false); // 键盘是否显示
  const scrollView = useRef<ScrollView>(null);
  const scrollY = useRef(0); // 记录 ScrollView y轴滚动的位置

  const scrollToFocusedInput = useCallback(
    (bottomY: number) => {
      const keyboardTopY = ScreenHeight - height.current; // 键盘最顶部的 y 轴坐标值
      const offset = Math.ceil(bottomY - keyboardTopY);
      const triggerHeight = extraHeight! + footerHeight.current; // 触发滚动修复的偏移距离
      // console.log('offset', offset, triggerHeight);
      if (offset > -triggerHeight) {
        const y = scrollY.current + offset + triggerHeight;
        scrollView?.current?.scrollTo({ x: 0, y, animated: true });
      }
    },
    [extraHeight]
  );

  /** [x, y, width, height, pageX, pageY] */
  const measureCallback = useCallback(
    (...args: number[]) => {
      // console.log('measure', args);
      // 输入框底部坐标 = 顶部坐标 pageY + 输入框高度 height, Android需要两倍高度
      const bottomY = args[5] + args[3] * (IsAndroid ? 2 : 1);
      scrollToFocusedInput(bottomY);
    },
    [scrollToFocusedInput]
  );

  /**
   * ios 隐藏键盘的时候也会触发keyboardWillShow事件
   * 这里限制只有从隐藏状态到显示的时候才触发
   */
  const onShow = useCallback(
    (event: KeyboardEvent) => {
      // console.log('onShow', event);
      if (isShow.current) return;
      isShow.current = true;
      height.current = event.endCoordinates.height;
      setKeyboardHeight(event.endCoordinates.height);
      const input = TextInput.State.currentlyFocusedInput();
      input?.measure?.(measureCallback);
    },
    [measureCallback]
  );

  const onHide = useCallback((event: KeyboardEvent) => {
    // console.log('onHide', event);
    isShow.current = false;
    setKeyboardHeight(0);
  }, []);

  useEffect(() => {
    const showEvent = Keyboard.addListener(KEYBOARD_SHOW, onShow);
    const hideEvent = Keyboard.addListener(KEYBOARD_HIDE, onHide);

    return () => {
      showEvent.remove();
      hideEvent.remove();
    };
  }, [onShow, onHide]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // console.log('onScroll', event.nativeEvent);
      scrollY.current = event.nativeEvent.contentOffset.y;
    },
    []
  );

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    footerHeight.current = IsAndroid ? event.nativeEvent.layout.height : 0;
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={[styles.container, props.style]}
        contentContainerStyle={[styles.content, props.contentContainerStyle]}
        ref={scrollView}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {props.children}
        <View style={{ height: keyboardHeight }}></View>
      </ScrollView>
      <View onLayout={onLayout}>{props.footer}</View>
    </View>
  );
};

KeyboardAvoidView.defaultProps = {
  extraHeight: DEFAULT_EXTRA_HEIGHT,
};

export default memo(KeyboardAvoidView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 50,
  },
});
