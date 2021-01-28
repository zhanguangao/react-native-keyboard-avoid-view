import React from "react";
import { ScrollViewProps } from "react-native";
declare type KeyboardAvoidViewProps = {
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
declare const _default: React.NamedExoticComponent<KeyboardAvoidViewProps>;
export default _default;
