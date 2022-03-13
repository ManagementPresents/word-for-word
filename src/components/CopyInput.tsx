import { FC } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import Button from './buttons/Button';

import useStore from '../utils/store';
import { createMatchUrl } from '../utils/misc';

interface Props {
	copyText: string;
}

const CopyInput: FC<Props> = ({ copyText }: Props) => {
	const { selectedMatch } = useStore();

	return (
		// TODO: 'copyText' appears to be undefined
		<>
			{/* TODO: Bad interaction with copy to clipboard ): */}
			{/* <ReactTooltip event='click' effect='solid' type='dark' afterShow={handleShortTooltip} /> */}
			<CopyToClipboard text={copyText}>
				<input
					type="text"
					readOnly
					value={copyText}
					className="text-black cursor-pointer py-1 px-1 text-[12px] w-full sm:py-2 sm:px-2 sm:text-[16px]"
					data-tip="Copied!"
					data-place="right"
				/>
			</CopyToClipboard>

			<CopyToClipboard text={createMatchUrl(selectedMatch)}>
				{/* TODO: Figure out how to get data-tip working both in a component, AND with CopyToClipboard (they seem to clash with each other) */}
				<Button customStyle="green-match-button" copy="Copy Link" data-tip="Copied!" />
			</CopyToClipboard>
		</>
	);
};

export default CopyInput;
