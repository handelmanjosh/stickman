import React, { useRef, useState, useEffect } from 'react';

interface Position {
    x: number;
    y: number;
}

interface Dimensions {
    width: number;
    height: number;
}
type DraggableComponentProps = {
    id: number;
    onUpdate: (id: number, data: Partial<ComponentData>) => any;
    initialData: ComponentData;
    src: string;
};
export const DraggableComponent = ({ id, onUpdate, initialData, src }: DraggableComponentProps) => {
    const [dragging, setDragging] = useState(false);
    const [resizing, setResizing] = useState<string | null>(null);
    const [position, setPosition] = useState<Position>({ x: initialData.x, y: initialData.y });
    const [dimensions, setDimensions] = useState<Dimensions>({ width: initialData.width, height: initialData.height });
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
            ref.current.style.width = `${dimensions.width}px`;
            ref.current.style.height = `${dimensions.height}px`;
        }
    }, [position, dimensions]);

    useEffect(() => {
        // Update the parent whenever position or dimensions change
        onUpdate(id, { x: position.x, y: position.y, width: dimensions.width, height: dimensions.height });
    }, [position, dimensions]);


    const onMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setDragging(true);
    };

    const onResizeMouseDown = (corner: string) => (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setResizing(corner);
        event.stopPropagation();
    };

    const onMouseMove = (event: MouseEvent) => {
        if (dragging) {
            setPosition({
                x: position.x + event.movementX,
                y: position.y + event.movementY,
            });
        }

        if (resizing) {
            let deltaX = event.movementX;
            let deltaY = event.movementY;

            setDimensions(prevDimensions => ({
                width: prevDimensions.width + deltaX,
                height: prevDimensions.height + deltaY,
            }));
        }
    };

    const onMouseUp = () => {
        setDragging(false);
        setResizing(null);
    };

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, resizing, position, dimensions]);

    return (
        <div ref={ref} className="relative cursor-move" onMouseDown={onMouseDown}>
            <img src={src} className="w-full h-full select-none" draggable="false" />
            <div
                className="absolute bottom-0 right-0 w-2 h-2 bg-white border border-black -mb-1 -mr-1 cursor-se-resize flex items-center justify-center"
                onMouseDown={onResizeMouseDown('se')}
            >
            </div>
        </div>
    );
};


interface ComponentData {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}
type DraggableComponentParentProps = {
    type: string,
    report: (components: any) => any;
    src: string;
    initialData: { width: number, height: number; };
    start: ComponentData[];
};
export function DraggableComponentParent({ type, report, src, initialData, start }: DraggableComponentParentProps) {
    const [components, setComponents] = useState<ComponentData[]>(start);
    const [nextId, setNextId] = useState(start.length);

    const spawnComponent = () => {
        setComponents([
            ...components,
            {
                id: nextId,
                x: 0,
                y: 0,
                width: initialData.width,
                height: initialData.height,
            },
        ]);
        setNextId(nextId + 1);
    };

    const updateComponent = (id: number, data: Partial<ComponentData>) => {
        setComponents((prevComponents) => {
            const newComponents = prevComponents.map((comp) => (comp.id === id ? { ...comp, ...data } : comp));
            report(newComponents.map((component) => {
                return {
                    ...component,
                    type: type
                };
            }));
            return newComponents;
        });
    };

    return (
        <div>
            <img src={src} className="w-10 h-auto -z-10 hover:cursor-pointer select-none" draggable="false" onClick={spawnComponent} />
            {/* <button className="z-10" onClick={spawnComponent}>Spawn Component</button> */}
            <div className="relative z-0" id={`component-parent-${type}`}>
                {components.map((comp) => (
                    <div key={comp.id} className="absolute top-0 left-0 -z-10 w-[1px] h-[1px]">
                        <DraggableComponent id={comp.id} initialData={comp} src={src} onUpdate={updateComponent} />
                    </div>
                ))}
            </div>
        </div>
    );
}

