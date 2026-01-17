// 动态背景组件，包含动画层和渐变遮罩
export default function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-0">
            <div className="absolute inset-0 animated-bg" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
        </div>
    );
}
