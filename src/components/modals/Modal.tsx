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
                    <i className="modal-close" onClick={onRequestClose}>X</i>

                    <div className="modals-style">
                        {children}
                    </div>
                </Fragment>
            </ReactModal>
    );
};

export default Modal;