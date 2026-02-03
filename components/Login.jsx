import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlinePhone } from "react-icons/ai";
import { signInWithGoogle, signInWithPhoneNumberHelper, setupRecaptcha, registerWithEmail } from "../firebase";
import bgImage from "../assets/my-bg.jpg";

export default function Login() {
  const [step, setStep] = useState("choose"); // choose | verify | register
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // Registration form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  // Google login
  async function handleGoogle() {
    try { await signInWithGoogle(); } 
    catch (e) { alert("Google sign-in failed: " + e.message); }
  }

  // Phone login
  async function startPhoneAuth(e) {
    e.preventDefault();
    try {
      setupRecaptcha("recaptcha-container");
      const confirmationResult = await signInWithPhoneNumberHelper(phone);
      setConfirmation(confirmationResult);
      setStep("verify");
    } catch (err) { alert("Phone sign-in failed: " + err.message); }
  }

  async function verifyCode(e) {
    e.preventDefault();
    try { await confirmation.confirm(code); }
    catch (err) { alert("Code verification failed: " + err.message); }
  }

  // Email registration
  async function handleRegister(e) {
    e.preventDefault();
    if (!agree) return alert("You must agree to terms");
    if (password !== confirmPassword) return alert("Passwords do not match");
    try {
      await registerWithEmail({ name, email, password, dob, address, phone });
      alert("Registration successful!");
    } catch (err) { alert("Registration failed: " + err.message); }
  }

  return (
    <div
      className="w-full h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-3xl p-10 shadow-xl w-4/5 max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Login to Health Assistant</h1>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          className="flex items-center justify-center gap-3 w-full py-2 rounded-full bg-white hover:shadow-lg transition"
        >
          <FcGoogle size={24} />
          <span className="font-semibold text-gray-700">Continue with Google</span>
        </button>

        {/* Phone Login */}
        {step === "choose" && (
          <form onSubmit={startPhoneAuth} className="space-y-3 mt-4">
            <div className="flex items-center gap-2 bg-white rounded-lg p-2">
              <AiOutlinePhone size={24} className="text-cyan-500" />
              <input
                type="tel"
                className="w-full border-none focus:ring-0 outline-none"
                placeholder="+91 9876543210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <div id="recaptcha-container" />
            <button type="submit" className="flex items-center justify-center gap-2 w-full py-2 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition mt-2">
              <AiOutlinePhone size={20} />
              Continue with Phone
            </button>

            <p className="text-center text-sm text-gray-500 mt-3">
              Don't have an account? <span className="text-cyan-500 cursor-pointer" onClick={()=>setStep("register")}>Register</span>
            </p>
          </form>
        )}

        {/* Phone verification */}
        {step === "verify" && (
          <form onSubmit={verifyCode} className="space-y-3 mt-4">
            <input
              type="text"
              className="w-full p-2 rounded-lg border border-gray-300 outline-none"
              value={code}
              onChange={e=>setCode(e.target.value)}
              placeholder="Enter verification code"
              required
            />
            <button type="submit" className="w-full py-2 rounded-full bg-cyan-500 text-white hover:shadow-lg transition">Verify</button>
          </form>
        )}

        {/* Registration */}
        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-2 border rounded-lg"/>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2 border rounded-lg"/>
            <input type="tel" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} required className="w-full p-2 border rounded-lg"/>
            <input type="date" placeholder="Date of Birth" value={dob} onChange={e=>setDob(e.target.value)} required className="w-full p-2 border rounded-lg"/>
            <input type="text" placeholder="Address" value={address} onChange={e=>setAddress(e.target.value)} required className="w-full p-2 border rounded-lg"/>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-2 border rounded-lg"/>
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required className="w-full p-2 border rounded-lg"/>
            
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={agree} onChange={()=>setAgree(!agree)}/>
              <span className="text-sm text-gray-500">I agree to the terms & conditions</span>
            </div>

            <button type="submit" className="w-full py-2 rounded-full bg-cyan-500 text-white hover:shadow-lg transition">Register</button>

            <div className="text-xs text-gray-700 pt-4 text-center">
              Already have an account? <span className="text-blue-600 cursor-pointer" onClick={()=>setStep("choose")}>Login</span>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
