import ReactModal from 'react-modal';
import { FC, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as Lobby } from '../../data/Lobby.svg';

ReactModal.setAppElement('#root');

const modalStyle = {
	overlay: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
	},
	// content: {
	//     width: '750px',
	//     height: '750px',
	//     position: 'relative',
	//     backgroundColor: '#3C2A34',
	//     border: '0',
	//     borderRadius: '15%',
	//     padding: '3rem',
	//     inset: '0',
	// },
};

interface Props {
	isOpen: boolean;
	onRequestClose: any;
	children: any;
	isLobbyReturn?: boolean;
}

const Modal: FC<Props> = ({ isOpen, isLobbyReturn, onRequestClose, children }: Props) => {
	const navigate = useNavigate();

	return (
		<ReactModal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			style={modalStyle}
			className="modal"
		>
			<Fragment>
				{isLobbyReturn ? (
					<i
						className="fixed top-6 right-6 p-1 rounded-full cursor-pointer"
						onClick={() => navigate('/lobby')}
					>
						<Lobby className="h-[50px] w-[50px]" />
					</i>
				) : (
					<i className="modal-close" onClick={onRequestClose}>
						X
					</i>
				)}

				<div className="modal-content">{children}</div>
			</Fragment>
		</ReactModal>
	);
};

export default Modal;
