"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import PageContainer from "@/components/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import axios from "axios";
import {
  AlignLeft,
  Bot,
  Loader2,
  Mic,
  MicOff,
  Notebook,
  Pause,
  Plus,
  Play,
  Send,
  Check,
  Copy,
  Eraser,
  StopCircle,
  BotIcon,
  Loader,
  SendIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogEditor } from "@/components/blog-editor";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LiveConnectionState,
  LiveTranscriptionEvent,
  LiveTranscriptionEvents,
  useDeepgram,
} from "@/app/contexts/DeepgramContextProvider";
import {
  MicrophoneState,
  useMicrophone,
} from "@/app/contexts/MicrophoneContextProvider";
import { useAutosizeTextArea } from "@/components/AutoSizeTextArea";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  publishDate: z.date(),
  coverImage: z.instanceof(File).optional(),
});

 function BlogPage() {
  // const [isListening, setIsListening] = useState(false);

  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcriptionTimeout = useRef<NodeJS.Timeout | null>(null);
  const dataListenerRef = useRef<((e: BlobEvent) => void) | null>(null);
  const transcriptListenerRef = useRef<
    ((data: LiveTranscriptionEvent) => void) | null
  >(null);

  const {
    connection,
    connectToDeepgram,
    disconnectFromDeepgram,
    connectionState,
  } = useDeepgram();
  const {
    setupMicrophone,
    microphone,
    startMicrophone,
    stopMicrophone,
    pauseMicrophone,
    resumeMicrophone,
    microphoneState,
  } = useMicrophone();

  const [activeTab, setActiveTab] = useState("chat");
  const [aiVisible, setAiVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  interface Message {
    id: number;
    text: string;
    sender: string;
  }
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea({
    textAreaRef,
    triggerAutoSize: text,
    minHeight: 130,
    maxHeight: 100,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  // Focus textarea when component mounts
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [])

  // const handleSendMessage = async () => {
  //   if (text.trim()) {
  //     const newMessage = {
  //       id: Date.now(),
  //       text: text,
  //       sender: "user",
  //     };

  //     setMessages((prevMessages) => [...prevMessages, newMessage]);
  //     setText("");

  //     const aiMessage = {
  //       id: Date.now() + 1,
  //       text: "", // Start with an empty string
  //       sender: "ai",
  //     };

  //     setMessages((prevMessages) => [...prevMessages, aiMessage]);

  //     const eventSource = new EventSource(`/api/generate?transcription=${encodeURIComponent(text)}`);

  //     eventSource.onmessage = (event) => {
  //       try {
  //         const data = JSON.parse(event.data);
  //         if (data.text) {
  //           setMessages((prevMessages) => {
  //             const updatedMessages = prevMessages.map((msg) => {
  //               if (msg.id === aiMessage.id) {
  //                 return { ...msg, text: msg.text + data.text };
  //               }
  //               return msg;
  //             });
  //             return updatedMessages;
  //           });
  //         } else if (data.error) {
  //           console.error("Error from API:", data.error);
  //           eventSource.close();
  //           setIsLoading(false);
  //         }
  //       } catch (error) {
  //         console.error("Error parsing event data:", error);
  //         setMessages((prevMessages) => {
  //           const updatedMessages = prevMessages.map((msg) => {
  //             if (msg.id === aiMessage.id) {
  //               return { ...msg, text: msg.text + "Error generating content" };
  //             }
  //             return msg;
  //           });
  //           return updatedMessages
  //         })
  //         eventSource.close();
  //         setIsLoading(false);
  //       }
  //     };

  //     eventSource.onerror = (error) => {
  //       console.error("EventSource error:", error);
        
  //       eventSource.close();
  //       setIsLoading(false);
  //     };

  //     eventSource.onopen = () => {
  //       setIsLoading(true);
  //     };

  //     eventSource.close = () => {
  //       setIsLoading(false);
  //     };
  //   }
  // };
  const handleSendMessage = async () => {
    if (text.trim()) {
      const newMessage = {
        id: Date.now(),
        text: text,
        sender: "user",
      };
  
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setText("");
  
      try {
        setIsLoading(true);
        const response = await axios.post("/api/generate", { transcription: text });
        const data = response.data;
  
        if (data.text) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Date.now(),
              text: data.text,
              sender: "ai",
            },
          ]);
        } else if (data.error) {
          console.error("Error from API:", data.error);
          // Optionally, add an error message to the chat:
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              id: Date.now(),
              text: "Error: " + data.error,
              sender: "ai",
            },
          ]);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Optionally, add an error message to the chat:
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: "An error occurred. Please try again.",
            sender: "ai",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      publishDate: new Date(),
      coverImage: undefined,
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  const onChange = (content: string) => {};
  useEffect(() => {
    return () => {
      cleanupListeners();
      stopMicrophone();
      disconnectFromDeepgram();
      if (transcriptionTimeout.current) {
        clearTimeout(transcriptionTimeout.current);
      }
    };
  }, []);

  // Handle microphone state changes
  useEffect(() => {
    switch (microphoneState) {
      case MicrophoneState.Error:
        setIsProcessing(false);
        setError("Failed to initialize microphone");
        break;
      case MicrophoneState.Ready:
        handleDeepgramConnection();
        break;
    }
  }, [microphoneState]);

  const cleanupListeners = () => {
    if (microphone && dataListenerRef.current) {
      microphone.removeEventListener("dataavailable", dataListenerRef.current);
      dataListenerRef.current = null;
    }
    if (connection && transcriptListenerRef.current) {
      connection.removeListener(
        LiveTranscriptionEvents.Transcript,
        transcriptListenerRef.current
      );
      transcriptListenerRef.current = null;
    }
  };

  // Handle Deepgram connection and transcription
  useEffect(() => {
    if (
      !microphone ||
      !connection ||
      connectionState !== LiveConnectionState.OPEN
    ) {
      return;
    }

    // Clean up any existing listeners
    cleanupListeners();

    // Create new listeners
    const onData = (e: BlobEvent) => {
      if (e.data.size > 0 && microphoneState === MicrophoneState.Recording) {
        connection.send(e.data);
      }
    };

    const onTranscript = (data: LiveTranscriptionEvent) => {
      if (transcriptionTimeout.current) {
        clearTimeout(transcriptionTimeout.current);
      }

      const transcript = data.channel.alternatives[0].transcript;
      const isFinal = data.is_final;

      if (transcript && isFinal) {
        setText((prev) => {
          const newText =
            prev + (prev && !prev.endsWith(" ") ? " " : "") + transcript;
          return newText;
        });
      }

      transcriptionTimeout.current = setTimeout(() => {
        setText((prev) => prev.trim());
      }, 1000);
    };

    // Store listeners in refs for cleanup
    dataListenerRef.current = onData;
    transcriptListenerRef.current = onTranscript;

    // Add new listeners
    connection.addListener(LiveTranscriptionEvents.Transcript, onTranscript);
    microphone.addEventListener("dataavailable", onData);

    startMicrophone();
    setIsProcessing(false);
    setError(null);

    // Cleanup function
    return () => {
      cleanupListeners();
      if (transcriptionTimeout.current) {
        clearTimeout(transcriptionTimeout.current);
      }
    };
  }, [connectionState, connection, microphone, microphoneState]);

  const handleDeepgramConnection = async () => {
    try {
      await connectToDeepgram({
        model: "nova-3",
        interim_results: true,
        smart_format: true,
        filler_words: true,
        utterance_end_ms: 2000,
      });
    } catch (err) {
      setIsProcessing(false);
      setError("Failed to connect to speech service");
    }
  };

  const handleStartRecording = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      await setupMicrophone();
    } catch (err) {
      setIsProcessing(false);
      setError("Failed to start recording");
    }
  };

  // const handleStopRecording = () => {
  //   stopMicrophone();
  //   disconnectFromDeepgram();
  //   setIsProcessing(false);
  //   toast({
  //     title: "Recording stopped",
  //     description: "Speech-to-text conversion has been stopped.",
  //   });
  // };
  const handleReset = () => {
    handleStopRecording();
    toast("Reset complete", {
      description: "Recording stopped.",
      duration: 1500,
    });
  };

  const handlePauseResume = () => {
    if (microphoneState === MicrophoneState.Recording) {
      pauseMicrophone();
      toast("Recording paused", {
        description: "Speech-to-text conversion has been paused.",
        duration: 1000,
      });
    } else if (microphoneState === MicrophoneState.Paused) {
      resumeMicrophone();
      toast("Recording resumed", {
        description: "Speech-to-text conversion has been resumed.",
        duration: 1500,
      });
    }
  };

  

  const handleClear = () => {
    setText("");
    toast("Cleared", {
      description: "Text has been cleared.",
      duration: 1000,
    });
  };

  const handleStartStopRecording = async () => {
    if (
      microphoneState === MicrophoneState.Ready ||
      microphoneState === MicrophoneState.NotSetup
    ) {
      if (isProcessing) return;
      setIsProcessing(true);
      setError(null);
      try {
        await setupMicrophone();
      } catch (err) {
        setIsProcessing(false);
        setError("Failed to start recording");
      }
    } else {
      handleStopRecording();
    }
  };

  const handleStopRecording = () => {
    stopMicrophone();
    setRecordingState("idle");
    disconnectFromDeepgram();
    setIsProcessing(false);
    toast("Recording stopped", {
      description: "Speech-to-text conversion has been stopped.",
      duration: 1000,
    });
  };
  const [messageCopied, setMessageCopied] = useState<number | null>(null)


  const handleAIMessageCopy = (msg: string, id: number) => {
    navigator.clipboard.writeText(msg)
    setMessageCopied(id)
    setTimeout(() => setMessageCopied(null), 2000)
  }

  const handleClearText = () => {
    setText("")
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }
  const [recordingState, setRecordingState] = useState<
    "idle" | "recording" | "paused" | "processing"
  >("idle");
  const getMainButtonContent = () => {
    switch (recordingState) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "recording":
        return <Pause className="h-4 w-6" />;
      case "paused":
        return <Play className="h-4 w-4" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };
  const handleMainButtonClick = async () => {
    switch (recordingState) {
      case "idle":
        setText("");
        setRecordingState("processing");
        setError(null);
        try {
          await handleStartStopRecording();

          setRecordingState("recording");
        } catch (err) {
          setRecordingState("idle");
          setError("Failed to start recording");
        }
        break;
      case "recording":
        pauseMicrophone();
        setRecordingState("paused");
        toast("Recording paused", {
          description: "Click resume to continue recording.",
          duration: 1500,
        });
        break;
      case "paused":
        resumeMicrophone();
        setRecordingState("recording");
        toast("Recording resumed", {
          description: "Speech-to-text conversion resumed.",
          duration: 1500,
        });
        break;
    }
  };
  const getMainButtonTooltip = () => {
    switch (recordingState) {
      case "processing":
        return "Processing...";
      case "recording":
        return "Stop Recording";
      case "paused":
        return "Resume Recording";
      default:
        return "Start Recording";
    }
  };

  const isRecording = microphoneState === MicrophoneState.Recording;
  const isPaused = microphoneState === MicrophoneState.Paused;

  return (
    <PageContainer>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Notebook className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">Create Blog</CardTitle>
            </div>
            Start writing your next blog post here.
          </div>
          <div>
          {(isRecording || isProcessing || error) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`mt-4 text-center text-sm ${
                            error ? "text-red-400" : "text-gray-400"
                          }`}
                        >
                          {error
                            ? error
                            : isProcessing
                            ? "Initializing..."
                            : isPaused
                            ? "Recording paused"
                            : "Recording in progress..."}
                        </motion.div>
                      )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAiVisible(!aiVisible);
              }}
              className=" "
            >
              <Bot className=" h-4 w-4" /> {aiVisible ? "Disable" : "Use"} AI
            </Button>

            {aiVisible && (
              <Select
                defaultValue="gemini"
                onValueChange={(value) => console.log(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  {/* <SelectItem value="gpt-3">GPT-3</SelectItem>
                  <SelectItem value="bert">BERT</SelectItem>
                  <SelectItem value="t5">T5</SelectItem> */}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => {}} className=" ">
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12  gap-3">
          {/* Blog Form (70%) */}
          <div className={`${aiVisible ? "col-span-12 lg:col-span-7" : "col-span-12"}`}>
            <Card>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Controller
                      name="title"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                      />
                      {errors?.title && (
                      <p className="text-red-500 text-sm">
                        {errors.title.message}
                      </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publishDate">Publish Date</Label>
                      <Controller
                      name="publishDate"
                      control={control}
                      render={({ field }) => (
                        <Input
                        type="date"
                        value={field.value?.toISOString().split("T")[0]}
                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                        />
                      )}
                      />
                      {errors?.publishDate && (
                      <p className="text-red-500 text-sm">
                        {errors.publishDate.message}
                      </p>
                      )}
                    </div>
                    </div>
                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <Controller
                      name="coverImage"
                      control={control}
                      render={({ field }) => (
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            field.onChange(e.target.files?.[0] || null)
                          }
                        />
                      )}
                    />
                    {errors?.coverImage && (
                      <p className="text-red-500 text-sm">
                        {errors.coverImage.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <BlogEditor
                      onChange={(content) => {
                        onChange(content);
                      }}
                    />
                  </div>
                  <Button type="submit">Submit</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface (30%) */}
          {aiVisible && (
           <div className="col-span-12 lg:col-span-5 h-full">
           <Card className="h-full backdrop-blur-lg  shadow-lg">
             <CardContent className="p-0 flex flex-col h-full">
               {/* Chat messages container */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 0.5 }}
                 className="flex-grow relative overflow-hidden"
                 style={{ height: "calc(100vh - 300px)" }}
               >
                 <div
                   ref={chatContainerRef}
                   className="absolute inset-0 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-blue-300"
                 >
                   <AnimatePresence initial={false}>
                     {messages.map((msg) => (
                       <motion.div
                         key={msg.id}
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: -20 }}
                         transition={{ duration: 0.2 }}
                         className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                       >
                         <div className="group relative">
                           <div
                             className={`max-w-[280px] sm:max-w-[350px] px-4 py-2 rounded-xl mb-2 text-sm ${
                               msg.sender === "user" ? "bg-blue-500 text-white" : "bg-secondary dark:bg-gray-800"
                             }`}
                           >

                             {msg.sender==="user"?msg.text:<MarkdownRenderer markdown={msg.text} />}
                           </div>
     
                           {msg.sender === "ai" && (
                             <div className="absolute top-1 right-0 transform translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                               <TooltipProvider>
                                 <Tooltip>
                                   <TooltipTrigger asChild>
                                     <Button
                                       size="icon"
                                       variant="ghost"
                                       className="h-7 w-7 rounded-full"
                                       onClick={() => handleAIMessageCopy(msg.text, msg.id)}
                                     >
                                       {messageCopied === msg.id? (
                                         <Check className="h-3.5 w-3.5 text-green-500" />
                                       ) : (
                                         <Copy className="h-3.5 w-3.5 text-gray-500" />
                                       )}
                                     </Button>
                                   </TooltipTrigger>
                                   <TooltipContent side="right" align="center">
                                     {messageCopied === msg.id ? "Copied!" : "Copy message"}
                                   </TooltipContent>
                                 </Tooltip>
                               </TooltipProvider>
                             </div>
                           )}
                         </div>
                       </motion.div>
                     ))}
                   </AnimatePresence>
     
                   {/* Loading indicator */}
                   {isLoading && (
                     <motion.div
                       initial={{ opacity: 0 }}
                       animate={{ opacity: 1 }}
                       className="flex items-center space-x-2 text-gray-500"
                     >
                       <Loader className="h-4 w-4 animate-spin" />
                       <span className="text-sm">Generating...</span>
                     </motion.div>
                   )}
     
                   {/* Spacer to ensure content is scrollable to bottom */}
                   <div className="h-4" />
                 </div>
               </motion.div>
     
               {/* Input area */}
               <div className="p-4 mt-auto backdrop-blur-sm">
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="rounded-lg h-[200px] shadow-md border relative py-2"
                 >
                   <Textarea
                     value={text}
                     onChange={(e) => setText(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === "Enter" && !e.shiftKey) {
                         e.preventDefault()
                         handleSendMessage()
                       }
                     }}
                     ref={textAreaRef}
                     placeholder="Type/Speak your message... (Shift + Enter for new line)"
                     className=" resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pb-14"
                   />
     
                   <div className="absolute bottom-0 inset-x-0 p-3 rounded-b-lg flex items-center justify-between gap-2 bg-background/80 backdrop-blur-sm">
                     <div className="flex items-center gap-2">
                       <AnimatePresence mode="wait">
                         <TooltipProvider key="main-button">
                           <Tooltip>
                             <TooltipTrigger asChild>
                               <Button
                                 onClick={handleMainButtonClick}
                                 disabled={recordingState === "processing"}
                                 variant="default"
                                 size="sm"
                                 className={`bg-red-600 hover:bg-red-700 rounded-full ${
                                   recordingState === "recording" ? "animate-pulse" : ""
                                 }`}
                               >
                                 {getMainButtonContent()}
                               </Button>
                             </TooltipTrigger>
                             <TooltipContent>{getMainButtonTooltip()}</TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
     
                         {recordingState !== "idle" && (
                           <TooltipProvider key="stop-button">
                             <Tooltip>
                               <TooltipTrigger asChild>
                                 <Button
                                   onClick={handleReset}
                                   variant="destructive"
                                   size="sm"
                                   className="bg-gray-700 hover:bg-gray-600 rounded-full ml-2"
                                 >
                                   <StopCircle className="h-4 w-4" />
                                 </Button>
                               </TooltipTrigger>
                               <TooltipContent>Stop Recording</TooltipContent>
                             </Tooltip>
                           </TooltipProvider>
                         )}
                       </AnimatePresence>
                     </div>
     
                     <div className="flex items-center gap-2">
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <Button
                               onClick={handleClearText}
                               variant="ghost"
                               size="sm"
                               className="text-gray-400 rounded-full"
                               disabled={!text || isRecording}
                             >
                               <Eraser className="h-4 w-4" />
                             </Button>
                           </TooltipTrigger>
                           <TooltipContent>Clear Text</TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
     
                       <Button
                         onClick={handleSendMessage}
                         disabled={!text.trim() || isRecording}
                         size="sm"
                         className="bg-blue-600 hover:bg-blue-700 rounded-full px-4"
                       >
                         <SendIcon/>
                       </Button>
                     </div>
                   </div>
                 </motion.div>
               </div>
             </CardContent>
           </Card>
         </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}


export default function Blog(){
  return (
    <DashboardLayout>
      <BlogPage />
    </DashboardLayout>
  )
}