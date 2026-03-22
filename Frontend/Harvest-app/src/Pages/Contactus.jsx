import React from 'react'

function Contactus() {
  return (
    <>
    <div className="grid md:grid-cols-2 gap-12 items-center">
    <div>
      <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
      <p className="text-stone-600 mb-6">Need help with your account? Or just want to talk shop about tomatoes? Drop us a line.</p>
      <div className="space-y-4">
        <p className="flex gap-3">📍 <span>123 Orchard Lane, Green Valley</span></p>
        <p className="flex gap-3">📧 <span>hello@harvesthand.io</span></p>
      </div>
    </div>
    <form className="bg-white p-8 rounded-xl shadow-md space-y-4">
      <input type="text" placeholder="Your Name" className="w-full p-3 border rounded-lg outline-green-600" />
      <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-lg outline-green-600" />
      <textarea placeholder="How can we help?" className="w-full p-3 border rounded-lg h-32 outline-green-600"></textarea>
      <button className="w-full py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800">Send Message</button>
    </form>
  </div>
    </>
  )
}

export default Contactus