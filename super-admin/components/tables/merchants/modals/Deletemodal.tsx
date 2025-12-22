import { useEffect } from "react";
import { MerchantData } from "../../../../interface/type";



interface prop {
   // modalopen: boolean
    user: MerchantData | null
    onClose: () => void
    bulk: any
    bulker:(bulk:any) => void
}


const DeleteUserModal = ({ user, onClose,  bulk, bulker }: prop) => {

    const Delete = () => {
        if(bulk.length > 1) {
            alert(`deleted for 2:", ${bulk}`)
        }else{
            alert(`deleted for 1:', ${user?.id || bulk}`)
        }
        onClose();
        bulker([]);

    }
   


    return (
        <>
            <div className='fixed inset-0 z-50 flex  items-center justify-center bg-black/20'>
                <div className='lg:w-[400px] absolute w-[90%] h-[220px] bg-white rounded-[12px] flex flex-col gap-[20px] p-[24px]'>
                    <h1 className='font-inter font-semibold '>Are you sure?</h1>

                    <p className='font-inter text-[14px]'>Are you sure you want to delete {bulk.length > 0 ? bulk.length : user?.id} records? This cannot be undone after confirmation.</p>
                    <div className="flex justify-center  gap-[15px]">

                        <button onClick={onClose} className='bg-white flex h-[40px] cursor-pointer w-[167px] border border-[#D0D5DD] rounded-[8px] items-center gap-[9px] justify-center'>
                            <p className='text-[14px] font-inter font-semibold'>Cancel</p>
                        </button>
                        <button onClick={Delete} className='bg-red-500 flex h-[40px]  cursor-pointer w-[167px] rounded-[8px] items-center gap-[9px] justify-center'>
                            <p className='text-[14px] font-inter text-white font-semibold'>Confirm</p>
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
};
export default DeleteUserModal;