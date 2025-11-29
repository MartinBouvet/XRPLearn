export function WalletIcon({ color = "blue", size = "md", className = "" }) {
    const colors = {
        blue: "fill-blue-500",
        red: "fill-red-500",
        green: "fill-green-500",
        purple: "fill-purple-500",
        gold: "fill-yellow-500",
    };

    const sizes = {
        sm: "w-12 h-12",
        md: "w-24 h-24",
        lg: "w-48 h-48",
    };

    const fillColor = colors[color] || colors.blue;
    const sizeClass = sizes[size] || sizes.md;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={`${sizeClass} ${className} transition-all duration-300`}
        >
            <path
                className={fillColor}
                d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.98 1-1.72V9c0-.74-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z"
            />
            <circle cx="16" cy="12" r="1.5" className="fill-white opacity-50" />
        </svg>
    );
}
