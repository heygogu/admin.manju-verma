"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import PageContainer from "@/components/page-container"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { ConfettiButton } from "@/components/magicui/confetti"
import { Bot, Loader, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRef, useState, useTransition } from "react"

import { toast } from "sonner"

import { useAutosizeTextArea } from "@/components/AutoSizeTextArea"
import MultipleSelector from "@/components/MultiSelector"
import { FileUploader } from "@/components/file-uploader"
import { useUploadFile } from "@/hooks/use-upload-file"
import { useRouter } from "next/navigation"
import { BorderBeam } from "@/components/magicui/border-beam"
import AIChat from "@/components/common/AIChat"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { BlogEditor } from "@/components/blog-editor"

// Schema based on the Mongoose model
const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot be more than 100 characters"),
  clientName: z.string().min(1, "Client name is required"),
  thumbnailImage: z.instanceof(File).optional(),
  description: z.string().min(1, "Description is required").max(500, "Description cannot be more than 500 characters"),
  emailType: z.enum(["Newsletter", "Marketing", "Transactional", "Promotional", "Other"], {
    required_error: "Please select an email type",
  }),
  industry: z.string().min(1, "Industry is required"),
  emailContent: z.string().min(1, "Email content is required"),
  subject: z.string().min(1, "Email subject is required"),
  results: z.object({
    openRate: z.number().min(0).max(100).optional(),
    clickRate: z.number().min(0).max(100).optional(),
    conversionRate: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
  }),
  completionDate: z.date().optional(),
  featured: z.boolean().default(false),
})

type FormValues = z.infer<typeof schema>

// Mock function for creating email - replace with actual implementation
const createEmail = async (data: any) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

// Mock function for uploading image - replace with actual implementation
const uploadImage = async ({ formData }: { formData: FormData }) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return {
    success: true,
    data: {
      data: {
        secure_url: `/placeholder.svg?height=400&width=800`,
      },
    },
  }
}

const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "retail", label: "Retail" },
  { value: "hospitality", label: "Hospitality" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "realestate", label: "Real Estate" },
]

const TAG_OPTIONS = [
  { value: "responsive", label: "Responsive" },
  { value: "mobile-friendly", label: "Mobile-friendly" },
  { value: "dark-mode", label: "Dark Mode" },
  { value: "light-mode", label: "Light Mode" },
  { value: "minimalist", label: "Minimalist" },
  { value: "colorful", label: "Colorful" },
  { value: "interactive", label: "Interactive" },
  { value: "animated", label: "Animated" },
  { value: "personalized", label: "Personalized" },
  { value: "seasonal", label: "Seasonal" },
  { value: "holiday", label: "Holiday" },
  { value: "promotional", label: "Promotional" },
  { value: "announcement", label: "Announcement" },
  { value: "welcome", label: "Welcome" },
]

function EmailFormPage() {
  const [text, setText] = useState("")
  const router = useRouter()
  const [aiVisible, setAiVisible] = useState(false)
  const [emailTags, setEmailTags] = useState<string[]>([])
  const [emailContent, setEmailContent] = useState("")

  const { onUpload, progresses, uploadedFiles, isUploading } = useUploadFile("imageUploader", {
    defaultUploadedFiles: [],
  })

  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  useAutosizeTextArea({
    textAreaRef,
    triggerAutoSize: text,
    minHeight: 130,
    maxHeight: 100,
  })

  const [imageUploadPending, startImageTransition] = useTransition()
  const [formPending, startFormTransition] = useTransition()
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      clientName: "",
      description: "",
      emailType: "Newsletter",
      industry: "",
      emailContent: "",
      subject: "",
      results: {
        openRate: 0,
        clickRate: 0,
        conversionRate: 0,
        notes: "",
      },
      completionDate: new Date(),
      featured: false,
    },
  })

  const onSubmit = async (data: FormValues) => {
    if (imageUploadPending) {
      toast.error("Please wait while we upload the thumbnail image")
      return
    }

    if (!data.thumbnailImage) {
      toast.error("Please upload a thumbnail image")
      return
    }

    try {
      const payload = {
        title: data.title,
        clientName: data.clientName,
        thumbnailImage: thumbnailImageUrl,
        description: data.description,
        emailType: data.emailType,
        industry: data.industry,
        emailContent: emailContent || data.emailContent,
        subject: data.subject,
        results: data.results,
        tags: emailTags,
        completionDate: data.completionDate,
        featured: data.featured,
      }

      startFormTransition(async () => {
        const result = await createEmail(payload)
        if (result.success) {
          router.replace("/emails")
          toast.success("Email created successfully!")
        } else {
          toast.error("Could not create email")
        }
      })
    } catch (error) {
      console.error("Error creating email:", error)
      toast.error("Could not create email", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

//   const handleImageUpload = async (file: File) => {
//     if (!file) return null

//     try {
//       const formData = new FormData()
//       formData.append("image", file)

//       startImageTransition(async () => {
//         const result = await uploadImage({ formData })
//         if (result.success) {
//           const imageUrl = result.data?.data?.secure_url
//           setThumbnailImageUrl(imageUrl)
//           toast.success("Thumbnail image uploaded successfully!")
//           return imageUrl
//         } else {
//           toast.error("Could not upload image")
//           return null
//         }
//       })
//     } catch (error) {
//       console.error("Error uploading image:", error)
//       return null
//     }
//   }

  return (
    <PageContainer>
      {formPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-lg">
          <Loader className="h-6 w-6 text-primary animate-spin" />
          <p className="mt-4 text-primary text-lg">{"Please wait while we create the email for you..."}</p>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">Create Email</CardTitle>
            </div>
            <p className="text-muted-foreground">Add a new email to your portfolio.</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAiVisible(!aiVisible)
              }}
              className="relative overflow-hidden"
            >
              <Bot className="h-4 w-4 mr-2" /> {aiVisible ? "Disable" : "Use"} AI
              <BorderBeam
                size={40}
                initialOffset={20}
                className="from-transparent via-blue-500 to-transparent"
                transition={{
                  type: "spring",
                  stiffness: 60,
                  damping: 20,
                }}
              />
            </Button>

            {aiVisible && (
              <Select defaultValue="gemini" onValueChange={(value) => console.log(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">Gemini</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          {/* Email Form */}
          <div className={`${aiVisible ? "col-span-12 lg:col-span-7" : "col-span-12"}`}>
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Title<span className="text-red-400">*</span>
                      </Label>
                      <Controller name="title" control={control} render={({ field }) => <Input {...field} />} />
                      {errors?.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        Client Name<span className="text-red-400">*</span>
                      </Label>
                      <Controller name="clientName" control={control} render={({ field }) => <Input {...field} />} />
                      {errors?.clientName && <p className="text-red-500 text-sm">{errors.clientName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnailImage">
                        Thumbnail Image<span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="thumbnailImage"
                        control={control}
                        render={({ field }) => (
                          <FileUploader
                            value={field.value ? [field.value] : []}
                            onValueChange={async (files) => {
                              field.onChange(files[0])
                              if (files[0]) {
                                // await handleImageUpload(files[0])
                              }
                            }}
                            maxFileCount={1}
                            maxSize={4 * 1024 * 1024}
                            progresses={progresses}
                            disabled={isUploading}
                          />
                        )}
                      />
                      {errors?.thumbnailImage && (
                        <p className="text-red-500 text-sm">{errors.thumbnailImage.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description<span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea {...field} placeholder="Describe the email campaign" className="min-h-[100px]" />
                        )}
                      />
                      {errors?.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="emailType">
                          Email Type<span className="text-red-400">*</span>
                        </Label>
                        <Controller
                          name="emailType"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select email type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Newsletter">Newsletter</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Transactional">Transactional</SelectItem>
                                <SelectItem value="Promotional">Promotional</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors?.emailType && <p className="text-red-500 text-sm">{errors.emailType.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">
                          Industry<span className="text-red-400">*</span>
                        </Label>
                        <Controller
                          name="industry"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                              <SelectContent>
                                {INDUSTRY_OPTIONS.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors?.industry && <p className="text-red-500 text-sm">{errors.industry.message}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">
                        Email Subject<span className="text-red-400">*</span>
                      </Label>
                      <Controller name="subject" control={control} render={({ field }) => <Input {...field} />} />
                      {errors?.subject && <p className="text-red-500 text-sm">{errors.subject.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <MultipleSelector
                        onChange={(value: any) => {
                          setEmailTags(value.map((item: any) => item.value))
                        }}
                        defaultOptions={TAG_OPTIONS}
                        placeholder="Select/Make Tags..."
                        creatable
                        emptyIndicator={
                          <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                            no results found.
                          </p>
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="completionDate">Completion Date</Label>
                        <Controller
                          name="completionDate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="date"
                              value={field.value ? new Date(field.value).toISOString().split("T")[0] : ""}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="featured">Featured Email</Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <Controller
                            name="featured"
                            control={control}
                            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                          />
                          <span className="text-sm text-muted-foreground">Display this email prominently</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Email Content */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Content</h3>
                    <div className="space-y-2">
                      <Label htmlFor="emailContent">
                        Content<span className="text-red-400">*</span>
                      </Label>
                      <BlogEditor
                        onChange={(content) => {
                          setEmailContent(content)
                        }}
                      />
                      {errors?.emailContent && <p className="text-red-500 text-sm">{errors.emailContent.message}</p>}
                    </div>
                  </div>

                  <Separator />

                  {/* Results */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Results (Optional)</h3>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="results.openRate">Open Rate (%)</Label>
                        <Controller
                          name="results.openRate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="results.clickRate">Click Rate (%)</Label>
                        <Controller
                          name="results.clickRate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="results.conversionRate">Conversion Rate (%)</Label>
                        <Controller
                          name="results.conversionRate"
                          control={control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="results.notes">Result Notes</Label>
                      <Controller
                        name="results.notes"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Additional notes about the email performance"
                            className="min-h-[80px]"
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <ConfettiButton type="submit" disabled={formPending || imageUploadPending} className="flex ml-auto">
                      {formPending || imageUploadPending ? (
                        <span className="flex items-center">
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {imageUploadPending ? "Uploading Image..." : "Creating Email..."}
                        </span>
                      ) : (
                        "Create Email"
                      )}
                    </ConfettiButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Interface */}
          {aiVisible && <AIChat aiVisible={aiVisible} />}
        </div>
      </div>
    </PageContainer>
  )
}

export default function EmailForm() {
  return (
    <DashboardLayout>
      <EmailFormPage />
    </DashboardLayout>
  )
}

