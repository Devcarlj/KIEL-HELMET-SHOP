import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle, FaCamera } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import Cropper from 'react-easy-crop'
import Axios from '../utils/Axios.js';
import SummaryApi from '../common/SummaryApi.js';
import AxiosToastError from '../utils/AxiosToastError.js';
import { updateAvatar, setUserDetails } from '../store/userSlice.js';
import toast from 'react-hot-toast';
import defaultUserAvatar from '../assets/default_user_profiles.png'

const Profile = () => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [openAvatarEdit, setOpenAvatarEdit] = useState(false);
  const [tempImage, setTempImage] = useState("");

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const [userData, setUserData] = useState({
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
  })

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      setTempImage(reader.result)
      setOpenAvatarEdit(true)
    }
  }

  const handleUploadAvatar = async () => {
    try {
      setLoading(true)
      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels)
      const formData = new FormData()
      formData.append('avatar', croppedImage, 'avatar.png')

      const response = await Axios({
        ...SummaryApi.uploadAvatar,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (response.data.success) {
        dispatch(updateAvatar(response.data.data.avatar))
        setOpenAvatarEdit(false)
        setTempImage("")
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      setLoading(true);
      const response = await Axios({ ...SummaryApi.deleteAvatar });
      if (response.data.success) {
        dispatch(updateAvatar(""));
        setOpenAvatarEdit(false);
        setTempImage("");
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSavingProfile(true)
      const response = await Axios({
        ...SummaryApi.updateUser,
        data: {
          name: userData.name,
          mobile: userData.mobile,
        }
      })
      if (response.data.success) {
        toast.success('Profile updated successfully!')
        dispatch(setUserDetails({ ...user, name: userData.name, mobile: userData.mobile }))
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className='max-w-2xl mx-auto p-4'>
      <h2 className='font-bold text-xl text-slate-800 mb-6'>Profile Details</h2>

      <div className='flex flex-col items-center gap-4 mb-8'>
        <div className='relative'>
          <div className='w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-md flex items-center justify-center'>
            {user.avatar ? (
              <img src={user.avatar} alt="Profile" className='w-full h-full object-cover' />
            ) : (
              <img src={defaultUserAvatar} alt="Default Profile" className='w-full h-full object-cover' />
            )}
          </div>
          <label htmlFor='profileImage' className='absolute bottom-0 right-0 p-2 bg-cta-green text-white rounded-full shadow-lg cursor-pointer'>
            <FaCamera size={14} />
            <input onChange={handleFileChange} type="file" id='profileImage' className='hidden' accept="image/*" />
          </label>
        </div>
      </div>

      {/* --- CROPPER MODAL OVERLAY --- */}
      {openAvatarEdit && (
        <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden'>
            <div className='flex items-center justify-between p-4 border-b'>
              <h3 className='font-bold text-slate-800'>Edit Profile Picture</h3>
              <button onClick={() => setOpenAvatarEdit(false)} className='text-2xl text-slate-400'><IoClose /></button>
            </div>

            <div className='relative h-80 w-full bg-slate-900'>
              <Cropper
                image={tempImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className='p-6'>
              <label className='text-xs font-bold text-slate-400 uppercase mb-2 block'>Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(e.target.value)}
                className='w-full accent-cta-green mb-6'
              />

              <div className='flex flex-col gap-3'>
                <div className='flex gap-3'>
                  <button onClick={() => setOpenAvatarEdit(false)} className='flex-1 py-2 text-slate-500 font-semibold border rounded-lg'>
                    Cancel
                  </button>
                  <button onClick={handleUploadAvatar} disabled={loading} className='flex-2 py-2 bg-cta-green text-white font-bold rounded-lg flex items-center justify-center'>
                    {loading ? "Saving..." : "Save Image"}
                  </button>
                </div>

                {user.avatar && (
                  <button type='button' onClick={handleDeleteAvatar} className='text-red-500 text-sm hover:underline mt-2'>
                    Remove current photo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Form */}
      <form className='grid gap-5' onSubmit={handleSubmit}>
        <div className='grid gap-1'>
          <label className='text-sm font-semibold text-slate-600' htmlFor='name'>Full Name</label>
          <input type='text' id='name' name='name' value={userData.name} onChange={handleOnChange} className='w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-cta-green' />
        </div>

        <div className='grid gap-1'>
          <label className='text-sm font-semibold text-slate-600'>Email Address</label>
          <input type='email' value={userData.email} disabled className='w-full p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed' />
        </div>

        <div className='grid gap-1'>
          <label className='text-sm font-semibold text-slate-600' htmlFor='mobile'>Mobile Number</label>
          <input type='text' id='mobile' name='mobile' value={userData.mobile} onChange={handleOnChange} className='w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-cta-green' />
        </div>

        <button
          type='submit'
          disabled={savingProfile}
          className={`mt-4 w-full md:w-max px-8 py-3 font-bold rounded-lg text-white transition-all
            ${savingProfile ? 'bg-slate-300 cursor-not-allowed' : 'bg-cta-green hover:bg-opacity-90'}`}
        >
          {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve) => (image.onload = resolve));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png');
  });
}

export default Profile;