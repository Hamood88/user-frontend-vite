import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, setUserSession } from "../../../api"; // Adjust path as needed

export const MoondalaSplitAuth = () => {
  const navigate = useNavigate();

  // ---------------- USER STATE ----------------
  const [userMode, setUserMode] = useState<"login" | "register">("login");
  const [userMsg, setUserMsg] = useState("");

  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    invitedByCode: "",
    dateOfBirth: "",
    gender: "",
    country: "",
    phoneNumber: "",
    favoriteSport: "",
    interests: [] as string[],
  });

  // ---------------- STORE STATE ----------------
  const [storeMode, setStoreMode] = useState<"login" | "register">("login");
  const [storeMsg, setStoreMsg] = useState("");
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    email: "",
    password: "",
  });

  // --------- OPTIONS ----------
  const genderOptions = ["male", "female", "other"];
  const countryOptions = [
    "United States", "Canada", "United Kingdom", "Australia", "India", "China", "Japan", "Germany", "France", "Brazil", "Mexico"
  ];
  const sportOptions = [
    "Soccer", "Basketball", "American Football", "Baseball", "Tennis", "MMA", "Cricket", "Golf", "Swimming"
  ];
  const interestOptions = [
    "Technology", "Gaming", "Fitness", "Fashion", "Travel", "Food", "Music", "Investing", "Pets"
  ];

  // --------- HELPERS ----------
  const calculateAge = (dobString: string) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (Number.isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const userAge = useMemo(() => calculateAge(userForm.dateOfBirth), [userForm.dateOfBirth]);

  // --------- HANDLERS ----------
  const onUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleInterest = (interest: string) => {
    setUserForm((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((x) => x !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const onStoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMsg("");

    try {
      if (userMode === "login") {
        const data = await apiPost("/auth/login", {
          email: userForm.email,
          password: userForm.password,
        });
        setUserSession({ token: data.token, user: data.user });
        setUserMsg("✅ Login success!");
        navigate("/feed");
        return;
      }

      // REGISTER VALIDATION
      if (!userForm.firstName.trim() || !userForm.lastName.trim()) throw new Error("Name required");
      if (!userForm.dateOfBirth) throw new Error("DOB required");
      if (userAge !== null && userAge < 10) throw new Error("Must be 10+ years old");
      if (!userForm.phoneNumber.trim()) throw new Error("Phone required");

      const payload = {
        firstName: userForm.firstName,
        lastName: userForm.lastName,
        email: userForm.email,
        password: userForm.password,
        invitedByCode: userForm.invitedByCode,
        dateOfBirth: userForm.dateOfBirth,
        gender: userForm.gender,
        phoneNumber: userForm.phoneNumber,
        country: userForm.country,
        favoriteSport: userForm.favoriteSport,
        interests: userForm.interests,
      };

      const data = await apiPost("/auth/register", payload);
      setUserSession({ token: data.token, user: data.user });
      setUserMsg("✅ Registered successfully!");
      navigate("/feed");

    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Error";
      setUserMsg("❌ " + msg);
    }
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStoreMsg("ℹ️ Store routes not connected yet.");
  };

  // ================= RENDER =================
  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground font-body">
      
      {/* --- LEFT SIDE: USER --- */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 border-b md:border-b-0 md:border-r border-border relative">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              Moondala User
            </h1>
            <p className="text-muted-foreground">Social Commerce & Shared Profits</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2 flex mb-6 shadow-lg">
            <button
              onClick={() => setUserMode("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                userMode === "login" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setUserMode("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                userMode === "register" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleUserSubmit} className="space-y-4">
            {userMode === "register" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <input className="input-dark" name="firstName" placeholder="First Name" onChange={onUserChange} required />
                  <input className="input-dark" name="lastName" placeholder="Last Name" onChange={onUserChange} required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Date of Birth</label>
                      <input type="date" className="input-dark" name="dateOfBirth" onChange={onUserChange} required />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Gender</label>
                      <select className="input-dark" name="gender" onChange={onUserChange} required>
                        <option value="">Select...</option>
                        {genderOptions.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                   </div>
                </div>

                <input className="input-dark" name="phoneNumber" placeholder="Phone Number" onChange={onUserChange} required />
                
                <select className="input-dark" name="country" onChange={onUserChange} required>
                  <option value="">Select Country</option>
                  {countryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select className="input-dark" name="favoriteSport" onChange={onUserChange} required>
                  <option value="">Favorite Sport</option>
                  {sportOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="p-4 border border-border rounded-lg bg-background/50">
                  <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Interests</span>
                  <div className="flex flex-wrap gap-2 h-24 overflow-y-auto pr-2 custom-scrollbar">
                    {interestOptions.map(interest => (
                      <label key={interest} className="flex items-center space-x-2 bg-card px-3 py-1 rounded-full border border-border cursor-pointer hover:border-primary transition-colors">
                        <input 
                          type="checkbox" 
                          className="accent-primary"
                          checked={userForm.interests.includes(interest)} 
                          onChange={() => toggleInterest(interest)} 
                        />
                        <span className="text-sm">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <input className="input-dark" name="invitedByCode" placeholder="Referral Code (Optional)" onChange={onUserChange} />
              </div>
            )}

            <input className="input-dark" name="email" placeholder="Email Address" onChange={onUserChange} required />
            <input className="input-dark" name="password" type="password" placeholder="Password" onChange={onUserChange} required />

            <button type="submit" className="btn-primary w-full mt-4">
              {userMode === "login" ? "Sign In to User Account" : "Create User Account"}
            </button>
          </form>

          {userMsg && (
            <div className={`p-3 rounded-lg text-sm font-medium text-center ${userMsg.includes("✅") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {userMsg}
            </div>
          )}
        </div>
      </section>

      {/* --- RIGHT SIDE: STORE --- */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-muted/10 relative overflow-hidden">
        {/* Background Decorative Gradient */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-foreground">For Merchants</h2>
            <p className="text-muted-foreground">Manage your store and products</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-2 flex mb-6 shadow-lg">
            <button
              onClick={() => setStoreMode("login")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                storeMode === "login" ? "bg-secondary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setStoreMode("register")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                storeMode === "register" ? "bg-secondary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleStoreSubmit} className="space-y-4">
            {storeMode === "register" && (
              <input className="input-dark" name="storeName" placeholder="Store Name" onChange={onStoreChange} required />
            )}
            <input className="input-dark" name="email" placeholder="Store Email" onChange={onStoreChange} required />
            <input className="input-dark" name="password" type="password" placeholder="Password" onChange={onStoreChange} required />

            <button type="submit" className="btn-secondary w-full mt-4">
              {storeMode === "login" ? "Store Portal Login" : "Register New Store"}
            </button>
          </form>

          {storeMsg && <div className="text-center text-sm text-muted-foreground mt-4">{storeMsg}</div>}
        </div>
      </section>

    </div>
  );
};

export default MoondalaSplitAuth;