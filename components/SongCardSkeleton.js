export default function SongCardSkeleton() {
    return (
        <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-white/5">
            <div className="absolute inset-0 skeleton" />
            <div className="absolute top-0 left-0 right-0 p-3 flex gap-2">
                <div className="h-4 w-3/4 bg-white/10 rounded"></div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 flex justify-between items-center">
                <div className="h-3 w-1/3 bg-white/10 rounded"></div>
                <div className="w-7 h-7 rounded-full bg-white/10"></div>
            </div>
        </div>
    );
}
