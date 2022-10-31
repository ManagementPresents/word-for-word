import { FC } from 'react';

const Footer: FC = () => {
	return (
		<div className="flex items-right items-end text-xs flex-col gap-y-1 absolute right-2 bottom-2 md:text-sm">
			<span>alpha build 1.0.0</span>
			<span>
				developed and designed by{' '}
				<a
					className="font-medium yellow-link"
					href="https://unburntwitch.com/"
					target="_blank"
					rel="noreferrer"
				>
					zoë quinn
				</a>{' '}
				and{' '}
				<a
					className="font-medium yellow-link"
					href="https://enochspevivo.com"
					target="_blank"
					rel="noreferrer"
				>
					gabriel gonzalvez
				</a>
			</span>
		</div>
	);
};

export default Footer;
