import { FC } from 'react';

import Modal from './Modal';

interface Props {
	isOpen: boolean;
	onRequestClose: any;
	shouldCloseOnOverlayClick?: boolean;
	hideCloseButton?: boolean;
}

const WhatIsThisModal: FC<Props> = ({
	isOpen,
	onRequestClose,
	shouldCloseOnOverlayClick,
	hideCloseButton,
}: Props) => {
	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			shouldCloseOnOverlayClick={shouldCloseOnOverlayClick}
			hideCloseButton={hideCloseButton}
		>
			<h1 className="modal-header">What Is This?</h1>

			<p>
				this is a head-to-head, multiplayer, remix of{' '}
				<a
					className="font-medium yellow-link"
					href="https://www.nytimes.com/games/wordle/index.html"
					target="_blank"
					rel="noreferrer"
				>
					wordle
				</a>
				. it was designed and developed by both{' '}
				<a
					href="https://unburntwitch.com/"
					target="_blank"
					rel="noreferrer"
					className="font-medium yellow-link"
				>
					zoë quinn
				</a>{' '}
				and{' '}
				<a
					href="https://enochspevivo.com"
					target="_blank"
					rel="noreferrer"
					className="font-medium yellow-link"
				>
					gabriel
				</a>
				.
			</p>

			<p>
				the game is currently in a rough alpha stage. that is to say, it's playable, but
				expect some unpolished parts.
			</p>
		</Modal>
	);
};

export default WhatIsThisModal;
