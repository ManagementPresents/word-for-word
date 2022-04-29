import Login from '../components/Login';
import { useNavigate } from 'react-router-dom';

const LoginView = () => {
	const navigate = useNavigate();
	
	return (
		<div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<Login handleRegisterClick={() => { navigate('/register') }} />
		</div>
	);
};

export default LoginView;
