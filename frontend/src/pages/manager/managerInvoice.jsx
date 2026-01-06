import React from 'react'
import { BiCopy, BiEdit, BiRefresh, BiScan, BiSearch, BiTrash } from 'react-icons/bi'
import { FaPrint } from 'react-icons/fa6'
import { FiFilter } from 'react-icons/fi'
import { LuSquareArrowDownRight } from 'react-icons/lu'

export default function BackOfficeInvoice() {
  return (
    <div className='p-6 space-y-6 bg-gray-50 min-h-screen'>
      <div className="flex justify-between items-center">
        <h2 className='font-bold text-3xl'>Invoices</h2>
        <div className='flex items-center'>
          <button className='flex cursor-pointer bg-blue-500 hover:bg-gray-50 text-gray-50 hover:text-blue-500 text-sm space-x-3 px-3 py-1 border uppercase'>+ New Invoice</button>
           <div className="relative flex items-center">
             <input type="text" placeholder='Search here ...' className='border  border-gray-400 rounded-0 focus:border-blue-500 focus:outline-0 text-gray-500 py-[1.5px] pl-3 pr-5 relative left-[15px]' />
             <BiSearch className='text-gray-500  relative left-[-5px] '/>
            </div>  
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className='flex space-x-2'>
            <button className="border  text-green-500 hover:bg-green-500 hover:text-gray-50  text-xs flex items-center space-x-1  px-2">
               <FiFilter/> Show Filters
            </button>
            <button className="border  text-gray-500 hover:bg-gray-500 hover:text-gray-50  text-xs flex items-center space-x-1 py-1 px-3">
               <BiRefresh/> Refresh
            </button>
        </div>
        <div className='flex space-x-2'>
            <button className="border  text-gray-500 hover:bg-gray-500 hover:text-gray-50  text-xs flex items-center space-x-1 py-1 px-3">
               <BiCopy/> copy to clipboard
            </button>
            <button className="border  text-gray-50 bg-gray-500 hover:bg-gray-50 hover:text-gray-500  text-xs flex items-center space-x-1 py-1 px-3">
               <FaPrint/> Print
            </button>
        </div>
      </div>
      <hr className='text-gray-400' />
      <div className="bg-white overflow-x-auto">
        <table className='w-full table-auto text-gray-500 text-xs'>
        <thead className='border-b-4 border-gray-300'>
            <tr>
                <th className=' text-center py-1 px-2'> <input type='checkbox' /> </th>
                <th  className=' text-center py-1 px-2'>code</th>
                <th  className=' text-center py-1 px-2'>customer</th>
                <th  className=' text-center py-1 px-2'>Due Date</th>
                <th  className=' text-center py-1 px-2'>Taxes</th>
                <th  className=' text-center py-1 px-2'>G. total</th>
                <th  className=' text-center py-1 px-2'>Paid</th>
                <th  className=' text-center py-1 px-2'>WHT</th>
                <th  className=' text-center py-1 px-2'>Balance</th>
                <th  className=' text-center py-1 px-2'>Currency</th>
                <th  className=' text-center py-1 px-2'>Status</th>
                <th  className=' text-center py-1 px-2'>Created By</th>
                <th  className=' text-center py-1 px-2'>P.status</th>
                <th  className=' text-center py-1 px-2'>Date</th>
                <th  className=' text-center py-1 px-2'>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr className='border-b border-gray-300'>
                <td className=' text-center py-1 px-2'> <input type='checkbox' /> </td>
                <td  className=' text-center py-1 px-2'>241669</td>
                <td  className=' text-center py-1 px-2'>tyak origy</td>
                <td  className=' text-center py-1 px-2'>01/01/2026</td>
                <td  className=' text-center py-1 px-2'>1,002</td>
                <td  className=' text-center py-1 px-2'>9000</td>
                <td  className=' text-center py-1 px-2'>5000</td>
                <td  className=' text-center py-1 px-2'>0</td>
                <td  className=' text-center py-1 px-2'>0</td>
                <td  className=' text-center py-1 px-2'>Rwf</td>
                <td  className=' text-center py-1 px-2'>
                   <div className="bg-green-200 border font-semibold text-green-500 text-2xs p-1">closed</div>   
                </td>
                <td  className=' text-center py-1 px-2'>tyak origy</td>
                <td  className=' text-center py-1 px-2'>
                    <div className="bg-blue-200 border font-semibold text-blue-500 text-2xs p-1">Partially paid</div>
                </td>
                <td  className=' text-center py-1 px-2'>01/01/2026</td>
                <td  className=' text-center py-1 px-2'>
                    <div className="inline-flex border border-gray-200">
                        <button className='p-1 cursor-pointer'>
                            <BiScan/>
                        </button>
                        <button className='p-1 cursor-pointer'>
                            <BiEdit/>
                        </button>
                         <button className='p-1 cursor-pointer text-red-500'>
                            <BiTrash/>
                        </button>
                        <button className='p-1 px-3 bg-gray-100 cursor-pointer' >
                            <LuSquareArrowDownRight />
                        </button>
                    </div>
                </td>
            </tr>
             <tr className='border-b border-gray-300'>
                <td className=' text-center py-1 px-2'> <input type='checkbox' /> </td>
                <td  className=' text-center py-1 px-2'>241669</td>
                <td  className=' text-center py-1 px-2'>tyak origy</td>
                <td  className=' text-center py-1 px-2'>01/01/2026</td>
                <td  className=' text-center py-1 px-2'>1,002</td>
                <td  className=' text-center py-1 px-2'>9000</td>
                <td  className=' text-center py-1 px-2'>5000</td>
                <td  className=' text-center py-1 px-2'>0</td>
                <td  className=' text-center py-1 px-2'>0</td>
                <td  className=' text-center py-1 px-2'>Rwf</td>
                <td  className=' text-center py-1 px-2'>
                   <div className="bg-green-200 border font-semibold text-green-500 text-2xs p-1">closed</div>   
                </td>
                <td  className=' text-center py-1 px-2'>tyak origy</td>
                <td  className=' text-center py-1 px-2'>
                    <div className="bg-blue-200 border font-semibold text-blue-500 text-2xs p-1">Partially paid</div>
                </td>
                <td  className=' text-center py-1 px-2'>01/01/2026</td>
                <td  className=' text-center py-1 px-2'>
                    <div className="inline-flex border border-gray-200">
                        <button className='p-1 cursor-pointer'>
                            <BiScan/>
                        </button>
                        <button className='p-1 cursor-pointer'>
                            <BiEdit/>
                        </button>
                         <button className='p-1 cursor-pointer text-red-500'>
                            <BiTrash/>
                        </button>
                        <button className='p-1 px-3 bg-gray-100 cursor-pointer' >
                            <LuSquareArrowDownRight />
                        </button>
                    </div>
                </td>
            </tr>
             <tr className='border-b border-gray-300'>
                <td className=' text-center py-1 px-2'> <input type='checkbox' /> </td>
                <td  className=' text-center py-1 px-2'>241669</td>
                <td  className=' text-center py-1 px-2'>tyak origy</td>
                <td  className=' text-center py-1 px-2'>01/01/2026</td>
                <td  className=' text-center py-1 px-2'>1,002</td>
                <td  className=' text-center py-1 px-2'>9000</td>
                <td  className=' text-center py-1 px-2'>5000</td>
                <td  className=' text-center py-1 px-2'>0</td>
                <td  className=' text-center py-1 px-2'>0</td>
                <td  className=' text-center py-1 px-2'>Rwf</td>
                <td  className=' text-center py-1 px-2'>
                   <div className="bg-green-200 border font-semibold text-green-500 text-2xs p-1">closed</div>   
                </td>
                <td  className=' text-center py-1 px-2'>tyak origy</td>
                <td  className=' text-center py-1 px-2'>
                    <div className="bg-blue-200 border font-semibold text-blue-500 text-2xs p-1">Partially paid</div>
                </td>
                <td  className=' text-center py-1 px-2'>01/01/2026</td>
                <td  className=' text-center py-1 px-2'>
                    <div className="inline-flex border border-gray-200">
                        <button className='p-1 cursor-pointer'>
                            <BiScan/>
                        </button>
                        <button className='p-1 cursor-pointer'>
                            <BiEdit/>
                        </button>
                         <button className='p-1 cursor-pointer text-red-500'>
                            <BiTrash/>
                        </button>
                        <button className='p-1 px-3 bg-gray-100 cursor-pointer' >
                            <LuSquareArrowDownRight />
                        </button>
                    </div>
                </td>
            </tr>
        </tbody>
       </table>
      </div>
       

    </div>
  )
}
