"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import PageContainer from "@/components/page-container"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { ConfettiButton } from "@/components/magicui/confetti"
import { Bot, Globe, Loader, Plus, Trash2 } from "lucide-react"

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

// Schema based on the Mongoose model
const schema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title cannot be more than 100 characters"),
  clientName: z.string().min(1, "Client name is required"),
  url: z.string().min(1, "Website URL is required").url("Please enter a valid URL"),
  thumbnailImage: z.instanceof(File).optional(),
  description: z.string().min(1, "Description is required").max(500, "Description cannot be more than 500 characters"),
  role: z.string().min(1, "Role is required"),
  contentSections: z.array(
    z.object({
      title: z.string().min(1, "Section title is required"),
      content: z.string().min(1, "Section content is required"),
      image: z.instanceof(File).optional(),
    }),
  ),
  testimonial: z
    .object({
      quote: z.string().optional(),
      author: z.string().optional(),
      position: z.string().optional(),
    })
    .optional(),
  completionDate: z.date().optional(),
  featured: z.boolean().default(false),
})

type FormValues = z.infer<typeof schema>

// Mock function for creating website - replace with actual implementation
const createWebsite = async (data: any) => {
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

const ROLE_OPTIONS = [
  { value: "frontend", label: "Frontend Developer" },
  { value: "backend", label: "Backend Developer" },
  { value: "fullstack", label: "Full Stack Developer" },
  { value: "designer", label: "UI/UX Designer" },
  { value: "consultant", label: "Technical Consultant" },
  { value: "architect", label: "Solution Architect" },
]

const TAG_OPTIONS = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "tailwindcss", label: "Tailwind CSS" },
  { value: "typescript", label: "TypeScript" },
  { value: "nodejs", label: "Node.js" },
  { value: "mongodb", label: "MongoDB" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "portfolio", label: "Portfolio" },
  { value: "blog", label: "Blog" },
  { value: "cms", label: "CMS" },
  { value: "responsive", label: "Responsive Design" },
  { value: "seo", label: "SEO Optimized" },
  { value: "accessibility", label: "Accessibility" },
  { value: "pwa", label: "Progressive Web App" },
]

function WebsiteFormPage() {
  const [text, setText] = useState("")
  const router = useRouter()
  const [aiVisible, setAiVisible] = useState(false)
  const [websiteTags, setWebsiteTags] = useState<string[]>([])

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
  const [contentSectionImages, setContentSectionImages] = useState<(string | null)[]>([])

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      clientName: "",
      url: "",
      description: "",
      role: "",
      contentSections: [{ title: "", content: "", image: undefined }],
      testimonial: {
        quote: "",
        author: "",
        position: "",
      },
      completionDate: new Date(),
      featured: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contentSections",
  })

  const onSubmit = async (data: FormValues) => {
    if (imageUploadPending) {
      toast.error("Please wait while we upload images")
      return
    }

    if (!data.thumbnailImage) {
      toast.error("Please upload a thumbnail image")
      return
    }

    try {
      const contentSectionsWithImages = data.contentSections.map((section, index) => ({
        title: section.title,
        content: section.content,
        image: contentSectionImages[index] || "",
      }))

      const payload = {
        title: data.title,
        clientName: data.clientName,
        url: data.url,
        thumbnailImage: thumbnailImageUrl,
        description: data.description,
        role: data.role,
        contentSections: contentSectionsWithImages,
        testimonial: data.testimonial,
        tags: websiteTags,
        completionDate: data.completionDate,
        featured: data.featured,
      }

      startFormTransition(async () => {
        const result = await createWebsite(payload)
        if (result.success) {
          router.replace("/websites")
          toast.success("Website project created successfully!")
        } else {
          toast.error("Could not create website project")
        }
      })
    } catch (error) {
      console.error("Error creating website project:", error)
      toast.error("Could not create website project", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

//   const handleImageUpload = async (file: File, index?: number) => {
//     if (!file) return null

//     try {
//       const formData = new FormData()
//       formData.append("image", file)

//       startImageTransition(async () => {
//         const result = await uploadImage({ formData })
//         if (result.success) {
//           const imageUrl = result.data?.data?.secure_url

//           if (index !== undefined) {
//             // Content section image
//             setContentSectionImages((prev) => {
//               const newImages = [...prev]
//               newImages[index] = imageUrl
//               return newImages
//             })
//             toast.success(`Section image ${index + 1} uploaded successfully!`)
//           } else {
//             // Thumbnail image
//             setThumbnailImageUrl(imageUrl)
//             toast.success("Thumbnail image uploaded successfully!")
//           }

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
          <p className="mt-4 text-primary text-lg">{"Please wait while we create the website project for you..."}</p>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">Create Website Project</CardTitle>
            </div>
            <p className="text-muted-foreground">Add a new website project to your portfolio.</p>
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
          {/* Website Form */}
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
                      <Label htmlFor="url">
                        Website URL<span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="url"
                        control={control}
                        render={({ field }) => <Input {...field} placeholder="https://example.com" />}
                      />
                      {errors?.url && <p className="text-red-500 text-sm">{errors.url.message}</p>}
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
                          <Textarea {...field} placeholder="Describe the website project" className="min-h-[100px]" />
                        )}
                      />
                      {errors?.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">
                        Your Role<span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors?.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <MultipleSelector
                        onChange={(value: any) => {
                          setWebsiteTags(value.map((item: any) => item.value))
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
                        <Label htmlFor="featured">Featured Project</Label>
                        <div className="flex items-center space-x-2 pt-2">
                          <Controller
                            name="featured"
                            control={control}
                            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                          />
                          <span className="text-sm text-muted-foreground">Display this project prominently</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Content Sections */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Content Sections</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ title: "", content: "", image: undefined })}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Section
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="space-y-4 p-4 border rounded-md">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Section {index + 1}</h4>
                          {index > 0 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`contentSections.${index}.title`}>
                            Section Title<span className="text-red-400">*</span>
                          </Label>
                          <Input {...register(`contentSections.${index}.title` as const)} />
                          {errors?.contentSections?.[index]?.title && (
                            <p className="text-red-500 text-sm">{errors.contentSections[index]?.title?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`contentSections.${index}.content`}>
                            Section Content<span className="text-red-400">*</span>
                          </Label>
                          <Textarea
                            {...register(`contentSections.${index}.content` as const)}
                            className="min-h-[100px]"
                          />
                          {errors?.contentSections?.[index]?.content && (
                            <p className="text-red-500 text-sm">{errors.contentSections[index]?.content?.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`contentSections.${index}.image`}>Section Image</Label>
                          <Controller
                            name={`contentSections.${index}.image` as const}
                            control={control}
                            render={({ field }) => (
                              <FileUploader
                                value={field.value ? [field.value] : []}
                                onValueChange={async (files) => {
                                  field.onChange(files[0])
                                  if (files[0]) {
                                    // await handleImageUpload(files[0], index)
                                  }
                                }}
                                maxFileCount={1}
                                maxSize={4 * 1024 * 1024}
                                progresses={progresses}
                                disabled={isUploading}
                              />
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Testimonial */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Testimonial (Optional)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="testimonial.quote">Quote</Label>
                      <Controller
                        name="testimonial.quote"
                        control={control}
                        render={({ field }) => (
                          <Textarea {...field} placeholder="Client testimonial quote" className="min-h-[80px]" />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="testimonial.author">Author</Label>
                        <Controller
                          name="testimonial.author"
                          control={control}
                          render={({ field }) => <Input {...field} placeholder="Client name" />}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="testimonial.position">Position</Label>
                        <Controller
                          name="testimonial.position"
                          control={control}
                          render={({ field }) => <Input {...field} placeholder="Client position" />}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <ConfettiButton type="submit" disabled={formPending || imageUploadPending} className="flex ml-auto">
                      {formPending || imageUploadPending ? (
                        <span className="flex items-center">
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          {imageUploadPending ? "Uploading Images..." : "Creating Project..."}
                        </span>
                      ) : (
                        "Create Website Project"
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

export default function WebsiteForm() {
  return (
    <DashboardLayout>
      <WebsiteFormPage />
    </DashboardLayout>
  )
}

