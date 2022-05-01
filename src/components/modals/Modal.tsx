import ReactModal from 'react-modal';
import { FC, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as Lobby } from '../../assets/Lobby.svg';

ReactModal.setAppElement('#root');

const modalStyle = {
	overlay: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.75)',
	}
};

interface Props {
	isOpen: boolean;
	children: any;
	onRequestClose?: any;
	isLobbyReturn?: boolean;
	shouldCloseOnOverlayClick?: boolean;
	hideCloseButton?: boolean;
}

const Modal: FC<Props> = ({ 
	isOpen, 
	isLobbyReturn, 
	onRequestClose, 
	shouldCloseOnOverlayClick = true,
	hideCloseButton,
	children 
}: Props) => {
	const navigate = useNavigate();

	const renderCloseButton = () => {
		if (isLobbyReturn) {
			return (
				<i
				className="fixed top-6 right-6 p-1 rounded-full cursor-pointer"
				onClick={() => navigate('/lobby')}
				>
					<Lobby className="h-[50px] w-[50px]" />
				</i>
			);
		};

		if (!hideCloseButton) {
			return (
				<i className="modal-close" onClick={onRequestClose}>
					X
				</i>
			);
		}

		return <></>;
	}

	return (
		<ReactModal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			style={modalStyle}
			shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
			className="modal"
		>
			<Fragment>
				{renderCloseButton()}

				<div className="modal-content">{children}</div>
			</Fragment>
		</ReactModal>
	);
};

export default Modal;
