// import { Navigate } from 'react-router-dom';
import { Ripple } from 'react-spinners-css';

interface Props {
	enableCentering: boolean;
	fullHeight: boolean;
}

const Loading = ({ 
	enableCentering,
	fullHeight,
 }: Props) => {
	return (
		<div className={`grid ${fullHeight && 'h-screen'} ${enableCentering && 'place-items-center'}`}>
			<Ripple color={'#FFCE47'} size={200} />
		</div>
	);
};

export default Loading;
