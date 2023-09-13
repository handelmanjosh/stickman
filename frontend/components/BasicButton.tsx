

type BasicButton = {
    onClick: () => void;
    text: string;
};
export default function BasicButton({ onClick, text }: BasicButton) {
    return (
        <button onClick={onClick} className="bg-blue-600 text-white hover:brightness-90 active:brightness-75 py-2 px-6 rounded-md">
            {text}
        </button>
    );
}