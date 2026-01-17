import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MoondalaInput } from './MoondalaInput';
import { MoondalaButton } from './MoondalaButton';
import { ChevronRight, ChevronLeft, Upload, Check } from 'lucide-react';

interface SignUpShopFormProps {
  onSuccess: (message: string) => void;
}

export function SignUpShopForm({ onSuccess }: SignUpShopFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1: Basic
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Business
  const [businessAddress, setBusinessAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [website, setWebsite] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Step 3: Verification
  const [idFile, setIdFile] = useState<File | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalSteps = 3;

  const categories = [
    'Fashion & Apparel',
    'Electronics',
    'Home & Garden',
    'Beauty & Cosmetics',
    'Sports & Outdoors',
    'Food & Beverage',
    'Art & Crafts',
    'Other',
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (currentStep === totalSteps) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onSuccess('Shop submitted for review!');
      }, 2000);
    } else {
      handleNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all ${
                  step < currentStep
                    ? 'bg-gradient-to-r from-[#6B4CFA] to-[#32D1FF] border-transparent text-white'
                    : step === currentStep
                    ? 'border-[#6B4CFA] text-[#6B4CFA] bg-[#6B4CFA]/10'
                    : 'border-white/20 text-white/40 bg-white/5'
                }`}
                animate={{ scale: step === currentStep ? 1.1 : 1 }}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </motion.div>
              {step < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    step < currentStep
                      ? 'bg-gradient-to-r from-[#6B4CFA] to-[#32D1FF]'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-2">
          <span>Basic</span>
          <span>Business</span>
          <span>Verification</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <MoondalaInput
                id="shop-name"
                label="Shop Name"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
              />

              <MoondalaInput
                id="shop-email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <MoondalaInput
                id="shop-password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                showPasswordToggle
              />

              <div>
                <label className="block text-xs font-medium text-white/70 mb-2 ml-1">
                  Category <span className="text-[#F6C343]">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#6B4CFA] focus:ring-2 focus:ring-[#6B4CFA]/20 hover:border-white/20 transition-all"
                  style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)' }}
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0B1020] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <MoondalaInput
                id="shop-phone"
                label="Primary Contact Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </motion.div>
          )}

          {/* Step 2: Business */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <MoondalaInput
                id="business-address"
                label="Business Address"
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                required
              />

              <MoondalaInput
                id="tax-id"
                label="VAT / Tax ID"
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                required
              />

              <MoondalaInput
                id="website"
                label="Website (Optional)"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2 ml-1">
                  Shop Logo
                </label>
                {logoPreview ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all">
                    <Upload className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-sm text-white/60">Click to upload logo</span>
                    <span className="text-xs text-white/40 mt-1">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Verification */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* ID Upload */}
              <div>
                <label className="block text-xs font-medium text-white/70 mb-2 ml-1">
                  Upload ID / Business Documents <span className="text-[#F6C343]">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-white/40 hover:bg-white/5 transition-all">
                  {idFile ? (
                    <div className="text-center">
                      <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <span className="text-sm text-white/80">{idFile.name}</span>
                      <p className="text-xs text-white/50 mt-1">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-white/40 mb-2" />
                      <span className="text-sm text-white/60">Upload documents</span>
                      <span className="text-xs text-white/40 mt-1">PDF, JPG, PNG up to 10MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleIdUpload}
                    required
                  />
                </label>
              </div>

              {/* Status Badge Preview */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-white/60 mb-3">After submission, you'll see one of these statuses:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium border border-yellow-500/30">
                    Pending Review
                  </span>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                    Approved
                  </span>
                  <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium border border-red-500/30">
                    Rejected
                  </span>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  required
                  className="mt-0.5 w-5 h-5 rounded border-white/20 bg-white/5 text-[#6B4CFA] focus:ring-2 focus:ring-[#6B4CFA]/50 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                  I agree to the{' '}
                  <button type="button" className="text-[#32D1FF] hover:underline">
                    Terms of Service
                  </button>
                  {' and '}
                  <button type="button" className="text-[#32D1FF] hover:underline">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-2">
          {currentStep > 1 && (
            <MoondalaButton
              type="button"
              variant="secondary"
              onClick={handleBack}
              icon={<ChevronLeft className="w-5 h-5" />}
              className="flex-1"
            >
              Back
            </MoondalaButton>
          )}
          
          <MoondalaButton
            type="submit"
            variant="primary"
            isLoading={isLoading && currentStep === totalSteps}
            icon={currentStep === totalSteps ? undefined : <ChevronRight className="w-5 h-5" />}
            className="flex-1"
          >
            {currentStep === totalSteps ? 'Submit for Review' : 'Next'}
          </MoondalaButton>
        </div>

        {/* Progress Text */}
        <p className="text-center text-xs text-white/50">
          Step {currentStep} of {totalSteps}
        </p>
      </form>
    </motion.div>
  );
}
