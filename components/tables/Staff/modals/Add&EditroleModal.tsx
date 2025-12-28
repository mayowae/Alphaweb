"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form'
import { MerchantData } from '../../../../interface/type'


const schema = z.object({
    role: z.string().min(1, "role is required"),
    dashboard: z.string().min(1, "dashboard is required"),
    merchants: z.string().min(1, "merchants is required"),
    transactions: z.string().min(1, "transaction is required"),
    billings: z.string().min(1, "billing is required"),
    audits: z.string().min(1, "audits is required"),
    support: z.string().min(1, "support is required"),
})

type formdata = z.infer<typeof schema>

interface AddPackageProps {
    packag: boolean;
    onClose: () => void;
    mode: 'add' | 'edit';
    merchant?: MerchantData | null
}

const Addroles = ({ packag, onClose, mode, merchant }: AddPackageProps) => {

    const
        { register,
            handleSubmit,
            formState: { errors, isValid, isSubmitting },
            reset
        } = useForm<formdata>({
            resolver: zodResolver(schema),
            mode: "onChange",
        });

    const queryClient = useQueryClient();

    useEffect(() => {
        if (mode === "edit" && merchant) {
            reset({
                role: merchant.package,
                dashboard: merchant.amount,
                merchants: merchant.account,
                transactions: merchant.id,
                billings: merchant.created,
                audits: merchant.status,
                support: merchant.method
            });
        } else {
            reset({
                role: "",
                dashboard: "",
                merchants: "",
                transactions: "",
                billings: "",
                audits: "",
                support: ""
            });
        }
    }, [mode, merchant, reset]);


    const addpackage = useMutation({
        mutationFn: async (data: formdata) => {
            const res = await fetch("/api/merchants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["merchants"] });
        },
        onError(error: any) {

        }

    })


    const editpackage = useMutation({
        mutationFn: async (data: formdata) => {
            const res = await fetch(`/api/merchants/${merchant?.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            return res.json();
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["merchants"] });
        },
        onError(error: any) {

        }
    })

    const onSubmit = (data: formdata) => {
        console.log(data)
        if (mode === "add") {
            addpackage.mutate(data)
            console.log("addpackagedata", data)
        } else {
            editpackage.mutate(data)
            console.log("editpackagedata", data)
        }

        //onClose()
        reset()
    }

    return (
        <>
            {/* Overlay backdrop */}
            {packag && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black/20 z-40"
                />
            )}

            {/* Drawer container */}
            <div
                className={`fixed inset-y-0 right-0 h-screen w-[90%] sm:w-[500px] bg-white shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        flex flex-col ${packag ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header (fixed) */}
                <div className="flex items-center justify-between p-4 border-b  bg-white z-10">
                    <h1 className="text-lg font-semibold font-inter max-md:text-base">
                        {mode === "add" ? "Create Role" : "Edit Role"}
                    </h1>
                    <Image
                        src="/icons/close.svg"
                        alt="close"
                        width={14}
                        height={14}
                        className="cursor-pointer"
                        onClick={onClose}
                    />
                </div>

                {/* Scrollable form content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 ">
                    <form onSubmit={handleSubmit(onSubmit)} id="merchantForm" className="space-y-5">
                        <div>
                            <p className="mb-1 text-sm font-medium font-inter">Role name</p>
                            <input
                                type="text"
                                placeholder="John Doe"
                                {...register("role")}
                                className="w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none"
                            />
                            <p className="text-sm text-red-500">{errors.role?.message}</p>
                        </div>

                        <h1 className='font-inter font-semibold'>Access permissions</h1>

                        <div>
                            <p className="mb-1 text-sm font-medium font-inter">Dashboard</p>
                            <select
                                {...register("dashboard")}
                                className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]"
                            >
                                <option value="">Select role</option>
                                <option value="Admin">Admin</option>
                                <option value="Officer">Officer</option>
                            </select>
                            <p className="text-sm text-red-500">{errors.dashboard?.message}</p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium font-inter">Merchants</p>
                            <select
                                {...register("merchants")}
                                className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px]"
                            >
                                <option value="">Select role</option>
                                <option value="Admin">Admin</option>
                                <option value="Officer">Officer</option>
                            </select>
                            <p className="text-sm text-red-500">{errors.merchants?.message}</p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium font-inter">Transactions</p>
                            <div className="relative w-full">
                                <select
                                    {...register("transactions")}
                                    className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] appearance-none"
                                >
                                    <option value="">Select role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Officer">Officer</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                                    <FaAngleDown className="w-4 h-4 text-[#8E8E93]" />
                                </div>
                            </div>
                            <p className="text-sm text-red-500">{errors.transactions?.message}</p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm font-medium font-inter">Plans & billings</p>
                            <div className="relative w-full">
                                <select
                                    {...register("billings")}
                                    className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] appearance-none"
                                >
                                    <option value="">Select role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Officer">Officer</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                                    <FaAngleDown className="w-4 h-4 text-[#8E8E93]" />
                                </div>
                            </div>
                            <p className="text-sm text-red-500">{errors.billings?.message}</p>
                        </div>


                        <div>
                            <p className="mb-1 text-sm font-medium font-inter">Audit logs</p>
                            <div className="relative w-full">
                                <select
                                    {...register("audits")}
                                    className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] appearance-none"
                                >
                                    <option value="">Select role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Officer">Officer</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                                    <FaAngleDown className="w-4 h-4 text-[#8E8E93]" />
                                </div>
                            </div>
                            <p className="text-sm text-red-500">{errors.audits?.message}</p>
                        </div>


                        <div>
                            <p className="mb-1 text-sm font-medium font-inter">Support & messages</p>
                            <div className="relative w-full">
                                <select
                                    {...register("support")}
                                    className="w-full h-[45px] border border-[#D0D5DD] outline-none p-[10px] rounded-[4px] appearance-none"
                                >
                                    <option value="">Select role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Officer">Officer</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                                    <FaAngleDown className="w-4 h-4 text-[#8E8E93]" />
                                </div>
                            </div>
                            <p className="text-sm text-red-500">{errors.support?.message}</p>
                        </div>

                    </form>
                </div>

                {/* Footer (fixed) */}
                <div className="border-t bg-white p-4 flex justify-center">
                    <button
                        type="submit"
                        form="merchantForm"
                        disabled={!isValid || isSubmitting}
                        className={`bg-[#4E37FB] text-white font-medium h-[40px] w-[167px] rounded-[4px] flex items-center justify-center ${!isValid || isSubmitting
                            ? "opacity-70 cursor-not-allowed"
                            : "cursor-pointer"
                            }`}
                    >
                        {addpackage.isPending || editpackage.isPending
                            ? "Saving..."
                            : mode === "add"
                                ? "Create role"
                                : "Save Changes"}
                    </button>
                </div>


            </div>
        </>
    );

}

export default Addroles;