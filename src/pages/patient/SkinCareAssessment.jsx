import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// importing icons for the UI
import { FiUpload, FiX, FiCheck, FiCpu, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { fileAPI, aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdvancedDermatologyAssessmentView() {
  const [patientSymptoms, setPatientSymptoms] = useState('');
  const [dermImages, setDermImages] = useState([]); // Array of raw File instances
  const [thumbnailUrls, setThumbnailUrls] = useState([]); // Blob URLs for previewing locally
  const [isProcessing, setIsProcessing] = useState(false);
  const [loaderText, setLoaderText] = useState(''); 
  const [aiDermatologyReport, setAiDermatologyReport] = useState(null); 
  const [dragActiveState, setDragActiveState] = useState(false);
  
  // Ref for the hidden file input element
  const hiddenUploaderRef = useRef(null);

  // TODO: Add support for HEIC format from iPhones later, currently only standard web images
  const filterAndProcessImages = (files) => {
    const acceptedFiles = [];
    const generatedPreviews = [];

    Array.from(files).forEach(fileChunk => {
      // Basic mime type check for safety
      if (fileChunk.type.startsWith('image/')) {
        acceptedFiles.push(fileChunk);
        generatedPreviews.push(URL.createObjectURL(fileChunk));
      } else {
        toast.error(`Whoops! ${fileChunk.name} isn't an image format we support.`);
      }
    });

    setDermImages(oldFiles => [...oldFiles, ...acceptedFiles]);
    setThumbnailUrls(oldThumbs => [...oldThumbs, ...generatedPreviews]);
  };

  const handleDragHover = (e) => {
    e.preventDefault();
    setDragActiveState(true);
  };

  const handleDragExit = () => {
    setDragActiveState(false);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragActiveState(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      filterAndProcessImages(e.dataTransfer.files);
    }
  };

  const openFileBrowser = () => {
    hiddenUploaderRef.current.click();
  };

  const removeImageAt = (idxToRemove) => {
    setDermImages(curr => curr.filter((_, idx) => idx !== idxToRemove));
    // Memory leak prevention - always revoke object URLs!
    URL.revokeObjectURL(thumbnailUrls[idxToRemove]);
    setThumbnailUrls(curr => curr.filter((_, idx) => idx !== idxToRemove));
  };

  const submitToAstraAnalyzer = async (e) => {
    e.preventDefault();
    setIsProcessing(true); // Disable submit button, but we won't freeze the screen!
    
    // [BOUNTY 3] Background Async Processing
    // Instead of waiting with a full screen blocker, we use the background task runner pattern
    const aiPromise = new Promise(async (resolve, reject) => {
      try {
        let remoteImgUrls = [];
        
        // 1. Uploading images asynchronously in the background via fileAPI (which now handles its own background jobs)
        if (dermImages.length > 0) {
          const uploadQueue = dermImages.map(img => fileAPI.upload(img));
          const backendResponses = await Promise.all(uploadQueue);
          
          remoteImgUrls = backendResponses.map(res => {
            if (res.data && res.data.success) {
              return res.data.message; 
            }
            throw new Error('Image sync failure');
          });
        }

        // 2. Running AI assessment in the background
        const apiResult = await aiAPI.assessSkinCare({
          symptoms: patientSymptoms,
          images: remoteImgUrls
        });

        if (apiResult.data && apiResult.data.success) {
          setAiDermatologyReport(apiResult.data.assessment);
          resolve();
        } else {
          reject('Astra failed to process the request.');
        }
      } catch (err) {
        console.error("AI Analyzer crashed: ", err);
        reject('Network error. Is the backend server running?');
      } finally {
        setIsProcessing(false);
      }
    });

    toast.promise(aiPromise, {
       loading: 'Astra AI is analyzing your skin in the background...',
       success: 'Dermatology analysis completed!',
       error: 'Analysis Failed'
    });
  };

  const resetAnalyzerState = () => {
    setPatientSymptoms('');
    setDermImages([]);
    thumbnailUrls.forEach(url => URL.revokeObjectURL(url));
    setThumbnailUrls([]);
    setAiDermatologyReport(null);
  };

  const buildSectionCard = (titleText, innerHTMLContent) => {
    return (
      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCpu /> {titleText}
        </h4>
        <div
          className="skin-assessment-markdown"
          style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}
          dangerouslySetInnerHTML={{ __html: innerHTMLContent }}
        />
      </div>
    );
  };

  // Hacky parser to convert markdown to html without a heavy library like marked.js
  const customMarkdownToHtml = (rawMarkdown) => {
    if (!rawMarkdown) return { causesBlock: '', remedyBlock: '', actionBlock: '', legalDisclaimer: '' };

    const hdr1 = '### Potential Causes';
    const hdr2 = '### Possible Remedies';
    const hdr3 = '### Recommendations / Next Steps';

    let causesBlock = '';
    let remedyBlock = '';
    let actionBlock = '';
    let legalDisclaimer = '';

    const i1 = rawMarkdown.indexOf(hdr1);
    const i2 = rawMarkdown.indexOf(hdr2);
    const i3 = rawMarkdown.indexOf(hdr3);

    if (i1 !== -1) {
      const endPointer = i2 !== -1 ? i2 : (i3 !== -1 ? i3 : rawMarkdown.length);
      causesBlock = rawMarkdown.substring(i1 + hdr1.length, endPointer).trim();
    }

    if (i2 !== -1) {
      const endPointer = i3 !== -1 ? i3 : rawMarkdown.length;
      remedyBlock = rawMarkdown.substring(i2 + hdr2.length, endPointer).trim();
    }

    if (i3 !== -1) {
      actionBlock = rawMarkdown.substring(i3 + hdr3.length).trim();
      const disclaimPos = actionBlock.indexOf('*(Disclaimer:');
      if (disclaimPos !== -1) {
        legalDisclaimer = actionBlock.substring(disclaimPos).trim();
        actionBlock = actionBlock.substring(0, disclaimPos).trim();
      }
    }

    const simpleRegexRenderer = (txt) => {
      if (!txt) return '';
      return txt
        .replace(/\n\n/g, '<br/><br/>')
        .replace(/\n- /g, '<br/>• ')
        .replace(/\n\* /g, '<br/>• ')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    return {
      causesBlock: simpleRegexRenderer(causesBlock),
      remedyBlock: simpleRegexRenderer(remedyBlock),
      actionBlock: simpleRegexRenderer(actionBlock),
      legalDisclaimer: simpleRegexRenderer(legalDisclaimer)
    };
  };

  const segmentedReport = customMarkdownToHtml(aiDermatologyReport);

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {!aiDermatologyReport ? (
          <motion.div
            key="input-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div>
              <h2 className="heading-md" style={{ color: 'var(--text-primary)', margin: 0 }}>AI Skin Care Assessment</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.5 }}>
                Describe your skin symptoms, upload photos, or do both to get an immediate AI-powered preliminary analysis.
              </p>
            </div>

            <form onSubmit={submitToAstraAnalyzer} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Describe your symptoms (optional)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="e.g., Red itchy rash on my left forearm for 2 days, feels dry..."
                  value={patientSymptoms}
                  onChange={(e) => setPatientSymptoms(e.target.value)}
                  style={{
                    borderRadius: '12px',
                    padding: '14px 18px',
                    fontSize: '0.95rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    width: '100%',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Upload Skin Images (optional)
                </label>

                <div
                  onDragOver={handleDragHover}
                  onDragLeave={handleDragExit}
                  onDrop={handleImageDrop}
                  onClick={openFileBrowser}
                  style={{
                    border: dragActiveState ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
                    background: dragActiveState ? 'rgba(0, 217, 166, 0.04)' : 'rgba(255,255,255,0.01)',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (!dragActiveState) {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = 'rgba(0, 217, 166, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!dragActiveState) {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.01)';
                    }
                  }}
                >
                  <input
                    type="file"
                    ref={hiddenUploaderRef}
                    onChange={(e) => filterAndProcessImages(e.target.files)}
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(0, 217, 166, 0.1)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                  }}>
                    <FiUpload />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>
                      Drag & drop skin images here or click to browse
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                      Supports JPEG, PNG, WEBP (Multiple files allowed)
                    </span>
                  </div>
                </div>

                {thumbnailUrls.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginTop: '16px',
                    padding: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                  }}>
                    {thumbnailUrls.map((url, i) => (
                      <div
                        key={i}
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <img
                          src={url}
                          alt={`Skin snippet ${i}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImageAt(i);
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.6)'}
                        >
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isProcessing}
                  style={{
                    padding: '12px 32px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minWidth: '120px',
                    justifyContent: 'center'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Next <FiPlus size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="analysis-result"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="heading-md" style={{ color: 'var(--text-primary)', margin: 0 }}>AI Skin Care Assessment Report</h2>
                <button
                  onClick={resetAnalyzerState}
                  className="btn btn-outline btn-sm"
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)' }}
                >
                  Start New Assessment
                </button>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                Preliminary evaluation based on reported symptoms and uploaded media.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {segmentedReport.causesBlock && buildSectionCard('Potential Causes', segmentedReport.causesBlock)}
              {segmentedReport.remedyBlock && buildSectionCard('Possible Remedies', segmentedReport.remedyBlock)}
              {segmentedReport.actionBlock && buildSectionCard('Recommendations / Next Steps', segmentedReport.actionBlock)}

              {segmentedReport.legalDisclaimer && (
                <div style={{
                  marginTop: '12px',
                  padding: '16px',
                  background: 'rgba(239, 68, 68, 0.02)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5
                }}>
                  <FiAlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                  <div dangerouslySetInnerHTML={{ __html: segmentedReport.legalDisclaimer }} />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* [BOUNTY 3] We completely removed the blocking full-screen loader so the user's browser doesn't freeze during heavy uploads or AI processing */}
    </div>
  );
}
