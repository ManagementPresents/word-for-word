import ReactModal from 'react-modal';
import { FC, Fragment, } from 'react';
import { useNavigate } from 'react-router-dom';

import { ReactComponent as Lobby } from '../../data/Lobby.svg'

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
    isLobbyReturn?: boolean,
}

const Modal: FC<Props> = ({ 
    isOpen, 
    isLobbyReturn,
    onRequestClose, 
    children, 
}: Props) => {
    const navigate = useNavigate();

    return (
            <ReactModal isOpen={isOpen} onRequestClose={onRequestClose} style={modalStyle} className="modals-style">
                <Fragment>
                    {isLobbyReturn ?
                        <i className="fixed top-6 right-6 p-1 rounded-full cursor-pointer" onClick={() => navigate("/lobby")} >
                            <Lobby className="h-[50px] w-[50px]" />
                        </i> : 
                        <i className="fixed top-6 right-6 text-6xl not-italic cursor-pointer transition-all hover:text-zinc-500" onClick={onRequestClose}>
                            'X'
                        </i>
                    } 

                    <div className="flex justify-center flex-col text-xs mx-auto gap-y-4 p-[2.5rem] md:text-base md:gap-y-8 md:p-12 md:max-w-lg">
                        {children}
                    </div>
                </Fragment>
            </ReactModal>
    );
};

export default Modal;