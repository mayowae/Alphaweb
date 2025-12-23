"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { FaAngleDown } from 'react-icons/fa'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form'
import { MerchantData } from '../../../../interface/type'
import { useQueryClient } from '@tanstack/react-query';



const schema = z.object({
  full_name: z.string().min(1, "Business name is required"),
  Email: z.string().min(1, "Business address is required"),
  phone_number: z.string().min(11, "phone number is required"),
  role: z.string().min(1, "role is required"),
})

type formdata = z.infer<typeof schema>

interface AddPackageProps {
  packag: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  merchant?: MerchantData | null
}

const Addpackage = ({ packag, onClose, mode, merchant }: AddPackageProps) => {

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
        full_name: merchant.package,
        Email: merchant.amount,
        phone_number: merchant.account,
        role: merchant.id,
      });
    } else {
      reset({
        full_name: "",
        Email: "",
        phone_number: "",
        role: ""
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
            {mode === "add" ? "Create Staff" : "Edit Staff"}
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
              <p className="mb-1 text-sm font-medium font-inter">Full Name</p>
              <input
                type="text"
                placeholder="John Doe"
                {...register("full_name")}
                className="w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none"
              />
              <p className="text-sm text-red-500">{errors.full_name?.message}</p>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium font-inter">Email</p>
              <input
                type="text"
                placeholder="johndoe@gmail.com"
                {...register("Email")}
                className="w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none"
              />
              <p className="text-sm text-red-500">{errors.Email?.message}</p>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium font-inter">Phone number</p>
              <input
                type="number"
                placeholder="+2347000000000"
                {...register("phone_number")}
                className="w-full h-[45px] border border-[#D0D5DD] p-[10px] rounded-[4px] outline-none"
              />
              <p className="text-sm text-red-500">{errors.phone_number?.message}</p>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium font-inter">Role</p>
              <div className="relative w-full">
                <select
                  {...register("role")}
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
              <p className="text-sm text-red-500">{errors.role?.message}</p>
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
                ? "Create Staff"
                : "Save Changes"}
          </button>
        </div>


      </div>
    </>
  );

}

export default Addpackage