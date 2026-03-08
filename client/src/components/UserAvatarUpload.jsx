import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { IoClose } from "react-icons/io5"

const AvatarModal = ({ image, onCancel, onSave, loading }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  

  return (
    <div className='fixed inset-0 z-100 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'>
      <div className='bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden'>
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-bold text-slate-800'>Crop Profile Picture</h3>
          <button onClick={onCancel} className='text-2xl text-slate-400 hover:text-slate-600'>
            <IoClose />
          </button>
        </div>

        {/* Cropper Container */}
        <div className='relative h-80 w-full bg-slate-900'>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {/* Controls */}
        <div className='p-6'>
          <div className='mb-6'>
            <label className='text-xs font-bold text-slate-400 uppercase mb-2 block'>Zoom Level</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(e.target.value)}
              className='w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-cta-green'
            />
          </div>

          <div className='flex gap-3'>
            <button 
              onClick={onCancel}
              className='flex-1 py-2 text-slate-500 font-semibold hover:bg-slate-50 rounded-lg transition-all'
            >
              Cancel
            </button>
            <button 
              onClick={() => onSave(croppedAreaPixels)}
              disabled={loading}
              className='flex-2 py-2 bg-cta-green text-white font-bold rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center min-h-11'
            >
              {loading ? <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div> : "Set Profile Picture"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarModal