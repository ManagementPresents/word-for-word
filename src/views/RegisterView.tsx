import { useNavigate } from 'react-router-dom';
import Register from '../components/Register';


// TODO: Need to add logic for if the email already exists
const RegisterView = () => {
	const navigate = useNavigate();

	return (
		<div className="min-h-full flex flex-col gap-y-4 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<Register handleReturnClick={() => { navigate('/') }}/>
		</div>
	);
};

export default RegisterView;
