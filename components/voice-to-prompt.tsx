"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Square, Play, Loader2, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type SpeechRecognition from "speech-recognition"

interface VoiceToPromptProps {
  onPromptGenerated?: (prompt: string) => void
}

export default function VoiceToPrompt({ onPromptGenerated }: VoiceToPromptProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [generatedPrompt, setGeneratedPrompt] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [confidence, setConfidence] = useState(0)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if Speech Recognition is supported
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setIsSupported(true)

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onstart = () => {
        setIsListening(true)
        toast({
          title: "🎤 Listening...",
          description: "Speak your prompt idea clearly",
        })
      }

      recognition.onresult = (event) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          const confidence = event.results[i][0].confidence

          if (event.results[i].isFinal) {
            finalTranscript += transcript
            setConfidence(confidence)
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript(finalTranscript + interimTranscript)
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
        toast({
          title: "Error",
          description: "Speech recognition failed. Please try again.",
          variant: "destructive",
        })
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }, [toast])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript("")
      setGeneratedPrompt("")
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const generatePromptFromSpeech = async () => {
    if (!transcript.trim()) return

    setIsProcessing(true)
    try {
      const response = await fetch("/api/prompt/voice-to-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedPrompt(data.prompt)
        onPromptGenerated?.(data.prompt)
        toast({
          title: "✨ Prompt Generated!",
          description: "Your speech has been converted to a structured prompt",
        })
      }
    } catch (error) {
      console.error("Error generating prompt from speech:", error)
      toast({
        title: "Error",
        description: "Failed to generate prompt from speech",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  if (!isSupported) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-semibold mb-2">Speech Recognition Not Supported</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Voice Input Controls */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />🎤 Voice to Prompt
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Speak your prompt idea and we'll convert it to a structured AI prompt
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={startListening}
              disabled={isListening || isProcessing}
              size="lg"
              className={`${
                isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-indigo-500 hover:bg-indigo-600"
              } text-white px-8`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>

            {isListening && (
              <Button
                onClick={stopListening}
                variant="outline"
                size="lg"
                className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          {/* Recording Status */}
          {isListening && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-600">Recording in progress...</span>
              </div>
              <p className="text-xs text-gray-500">Speak clearly and naturally</p>
            </div>
          )}

          {/* Live Transcript */}
          {transcript && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Live Transcript:</span>
                {confidence > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Confidence: {Math.round(confidence * 100)}%
                  </Badge>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {transcript || "Your speech will appear here..."}
                </p>
              </div>

              <Button
                onClick={generatePromptFromSpeech}
                disabled={isProcessing || !transcript.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {isProcessing ? "Converting..." : "✨ Convert to Prompt"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Prompt */}
      {generatedPrompt && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Play className="w-5 h-5 text-green-600" />🎯 Generated Prompt
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => speakText(generatedPrompt)}
                className="flex items-center gap-1"
              >
                <Volume2 className="w-4 h-4" />
                Listen
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              rows={4}
              className="bg-white/50 dark:bg-gray-800/50"
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigator.clipboard.writeText(generatedPrompt)} variant="outline" size="sm">
                Copy Prompt
              </Button>
              <Button onClick={() => setTranscript("")} variant="outline" size="sm">
                Clear & Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-0 shadow-sm bg-blue-50 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2">💡 Tips for better results:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Describe what you want the AI to do</li>
            <li>• Mention the desired tone or style</li>
            <li>• Include any specific requirements or constraints</li>
            <li>• Use a quiet environment for better recognition</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
