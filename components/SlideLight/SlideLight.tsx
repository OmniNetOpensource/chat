import './SlideLight.css'

interface SlideLightProps{
    text:string,
}

const SlideLight:React.FC<SlideLightProps> = ({text}) => {
    return (
        <span className="slidelight">
            {text}
        </span>
    );
}

export default SlideLight;