// import { Navigate } from 'react-router-dom';
import { Ripple } from 'react-spinners-css';

const Loading = ({ enableCentering }: any) => {
	return (
		<div className={`grid h-screen ${enableCentering ? 'place-items-center' : ''}`}>
			<Ripple color={'#FFCE47'} size={200} />
		</div>
	);
};

export default Loading;
