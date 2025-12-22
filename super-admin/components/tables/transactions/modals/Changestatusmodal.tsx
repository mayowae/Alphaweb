import React, { useState } from 'react'

import { MerchantData } from '../../../../interface/type';


interface ChangestatusmodalProps {
    modalopen: boolean;
    onClose: () => void;
    user: MerchantData | null
    bulk:any | null
    bulker:(bulk:any) => void
}

function ChangestatusModal({modalopen, onClose, user, bulk, bulker }: ChangestatusmodalProps) {

    const [status, setStatus] = useState(user?.status || '');

    const handleSubmit = () => {
        if(bulk?.length > 1) {
            alert(`change status for 2:", ${bulk}`)
        }else{
            alert(`change status for 1:', ${user?.id || bulk}`)
        }
        onClose();
        bulker([]);
    }

    if(!modalopen) return null

    return (
        <div>
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/20'>
                <div className='lg:w-[400px] w-[90%] absolute bg-white rounded-[12px] flex flex-col gap-[20px] p-[24px]'>
                    <h1 className='font-inter font-semibold '>Change Status</h1>
                    <p className='font-inter text-[14px]'>You have selected <span className='font-semibold'> {bulk?.length > 0 ? bulk?.length : user?.id} Merchants</span>
                    </p>

                    <div className=''>
                        <h1>Status</h1>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border w-full p-2 rounded"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>

                    <div className="flex justify-center mt-2 gap-[15px]">
                        <button onClick={onClose} className='bg-white flex h-[40px] cursor-pointer w-[167px] border border-[#D0D5DD] rounded-[4px] items-center gap-[9px] justify-center'>
                            <p className='text-[14px] font-inter font-semibold'>Close</p>
                        </button>

                        <button onClick={handleSubmit} className='bg-[#4E37FB] flex h-[40px]  cursor-pointer w-[167px] rounded-[4px] items-center gap-[9px] justify-center'>
                            <p className='text-[14px] font-inter text-white font-semibold'>Confirm</p>
                        </button>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangestatusModal