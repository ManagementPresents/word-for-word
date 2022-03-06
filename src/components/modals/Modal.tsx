import ReactModal from 'react-modal';
import { FC, Fragment, } from 'react';


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
    isOpen: boolean, 
    onRequestClose: any,
    children: any,
}

const Modal: FC<Props> = ({ isOpen, onRequestClose, children, }: Props) => {
    return (
            <ReactModal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyle} className="modals-style">
                <Fragment>
                    <i className="fixed top-6 right-6 text-6xl not-italic cursor-pointer transition-all hover:text-zinc-500" onClick={onRequestClose}>X</i>

                    <div className="flex justify-center flex-col text-xs mx-auto gap-y-4 p-[2.5rem] md:text-base md:gap-y-8 md:p-12 md:max-w-lg">
                        {children}
                    </div>
                </Fragment>
            </ReactModal>
    );
};

export default Modal;