import { FC, Fragment } from 'react';
import { Default } from 'react-spinners-css';

interface Props {
	onClick: any;
	copy: string;
	isLoading: boolean;
	isLoadingCopy: string;
	customStyle?: string;
	disabled?: boolean;
}

const LoadingButton: FC<Props> = ({
	onClick,
	customStyle,
	copy,
	disabled,
	isLoading,
	isLoadingCopy,
}: Props) => {
	// TODO: Should not have a hover state when disabled
	return (
		<button
			onClick={onClick}
			className={`${customStyle} py-2 px-4 rounded flex items-center justify-center gap-x-1.5 ${
				disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
			}`}
		>
			{isLoading ? (
				<Fragment>
					<span>{isLoadingCopy}</span> <Default color="#fff" size={20} />
				</Fragment>
			) : (
				<span>{copy}</span>
			)}
		</button>
	);
};

export default LoadingButton;
