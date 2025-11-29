export function Card({ children, className = "", onClick, selected = false }) {
    return (
        <div
            onClick={onClick}
            className={`
        card cursor-pointer transition-all duration-300 transform hover:scale-105
        ${selected ? "ring-4 ring-blue-500 scale-105" : ""}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
