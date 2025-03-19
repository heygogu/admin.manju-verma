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
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import { ConfettiButton } from "@/components/magicui/confetti";
import { Award, Loader, Star, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";

import { toast } from "sonner";

import { FileUploader } from "@/components/file-uploader";
import { useUploadFile } from "@/hooks/use-upload-file";
import { useRouter } from "next/navigation";
import { BorderBeam } from "@/components/magicui/border-beam";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/app/blogs/new/actions";
import { createTestimonial } from "./actions";

// Schema based on the Mongoose model
const schema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  clientImage: z.instanceof(File).optional(),
  clientDesignation: z.string().min(1, "Client designation is required"),
  companyName: z.string().min(1, "Company name is required"),
  companyUrl: z.string().url("Please enter a valid URL"),
  testimonial: z
    .string()
    .min(1, "Testimonial is required")
    .max(500, "Testimonial cannot be more than 500 characters"),
  isCompany: z.boolean().default(false),
  starRating: z.number().min(1).max(5),
});

type FormValues = z.infer<typeof schema>;

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          className={`h-6 w-6 cursor-pointer transition-colors ${
            rating <= value
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
          onClick={() => onChange(rating)}
        />
      ))}
    </div>
  );
}

function TestimonialFormPage() {
  const router = useRouter();
  const [clientImageUrl, setClientImageUrl] = useState<string | null>(null);

  const { progresses, isUploading } = useUploadFile("imageUploader", {
    defaultUploadedFiles: [],
  });

  const [imageUploadPending, startImageTransition] = useTransition();
  const [formPending, startFormTransition] = useTransition();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      clientName: "",
      clientDesignation: "",
      companyName: "",
      companyUrl: "",
      testimonial: "",
      isCompany: false,
      starRating: 5,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (imageUploadPending) {
      toast.error("Please wait while we upload the client image");
      return;
    }

    if (!clientImageUrl) {
      toast.error("Please upload a client or company image");
      return;
    }

    try {
      const payload = {
        clientName: data.clientName,
        clientImage: clientImageUrl,
        clientDesignation: data.clientDesignation,
        companyName: data.companyName,
        companyUrl: data.companyUrl,
        testimonial: data.testimonial,
        isCompany: data.isCompany,
        starRating: data.starRating,
      };

      startFormTransition(async () => {
        const result = await createTestimonial(payload);
        if (result.success) {
          router.replace("/testimonials/page/1");
          toast.success("Testimonial created successfully!");
        } else {
          toast.error("Could not create testimonial");
        }
      });
    } catch (error) {
      console.error("Error creating testimonial:", error);
      toast.error("Could not create testimonial", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <PageContainer>
      {formPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-lg">
          <Loader className="h-6 w-6 text-primary animate-spin" />
          <p className="mt-4 text-primary text-lg">
            {"Please wait while we create the testimonial for you..."}
          </p>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="h-7 w-7 text-primary" />
              <CardTitle className="text-2xl">Create Testimonial</CardTitle>
            </div>
            <p className="text-muted-foreground">
              Add a new testimonial to showcase your client's feedback.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="relative"
          >
            Back to Testimonials
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Card className="shadow-md ">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">
                      Testimonial Information
                    </h3>
                  </div>

                  <div className="space-y-2 mb-8">
                    <div className="flex items-center space-x-6">
                      <Label htmlFor="isCompany">Company Testimonial</Label>
                      <Controller
                        name="isCompany"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              id="isCompany"
                            />
                            <span className="text-sm text-muted-foreground">
                              {field.value ? "Company" : "Individual"}
                            </span>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">
                        {watch("isCompany")
                          ? "Company Representative"
                          : "Client Name"}
                        <span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="clientName"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={
                              watch("isCompany")
                                ? "e.g. John Smith"
                                : "e.g. Jane Doe"
                            }
                          />
                        )}
                      />
                      {errors?.clientName && (
                        <p className="text-red-500 text-sm">
                          {errors.clientName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="clientDesignation">
                        {watch("isCompany") ? "Position" : "Designation"}
                        <span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="clientDesignation"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder={
                              watch("isCompany")
                                ? "e.g. Marketing Director"
                                : "e.g. Entrepreneur"
                            }
                          />
                        )}
                      />
                      {errors?.clientDesignation && (
                        <p className="text-red-500 text-sm">
                          {errors.clientDesignation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">
                        Company Name<span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="companyName"
                        control={control}
                        render={({ field }) => (
                          <Input {...field} placeholder="e.g. Acme Corp" />
                        )}
                      />
                      {errors?.companyName && (
                        <p className="text-red-500 text-sm">
                          {errors.companyName.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyUrl">
                        Company Website<span className="text-red-400">*</span>
                      </Label>
                      <Controller
                        name="companyUrl"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="e.g. https://example.com"
                          />
                        )}
                      />
                      {errors?.companyUrl && (
                        <p className="text-red-500 text-sm">
                          {errors.companyUrl.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientImage">
                      {watch("isCompany") ? "Company Logo" : "Client Photo"}
                      <span className="text-red-400">*</span>
                    </Label>
                    <Controller
                      name="clientImage"
                      control={control}
                      render={({ field }) => (
                        <FileUploader
                          value={field.value ? [field.value] : []}
                          onValueChange={async (files) => {
                            field.onChange(files[0]);
                            if (!files[0]) return;
                            try {
                              const formData = new FormData();
                              formData.append("image", files[0]);

                              startImageTransition(async () => {
                                const result = await uploadImage({
                                  formData,
                                });
                                if (result.success) {
                                  toast.success("Image uploaded successfully!");
                                  setClientImageUrl(
                                    result.data?.data?.secure_url
                                  );
                                } else {
                                  toast.error("Could not upload image");
                                }
                              });
                            } catch (error) {
                              console.error("Error uploading image:", error);
                              toast.error("Failed to upload image");
                              return null;
                            }
                          }}
                          maxFileCount={1}
                          maxSize={4 * 1024 * 1024}
                          progresses={progresses}
                          disabled={isUploading}
                        />
                      )}
                    />
                    {!clientImageUrl && (
                      <p className="text-amber-500 text-sm">
                        Please upload an image (max 4MB, recommended square
                        format)
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="starRating">
                      Rating<span className="text-red-400">*</span>
                    </Label>
                    <Controller
                      name="starRating"
                      control={control}
                      render={({ field }) => (
                        <div className="pt-1">
                          <StarRating
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </div>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="testimonial">
                      Testimonial<span className="text-red-400">*</span>
                    </Label>
                    <Controller
                      name="testimonial"
                      control={control}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="What did the client say about your service?"
                          className="min-h-[150px] resize-none"
                        />
                      )}
                    />
                    {errors?.testimonial && (
                      <p className="text-red-500 text-sm">
                        {errors.testimonial.message}
                      </p>
                    )}
                    <div className="flex justify-end">
                      <span className="text-xs text-muted-foreground">
                        {watch("testimonial")?.length || 0}/500 characters
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <ConfettiButton
                    type="submit"
                    disabled={formPending || imageUploadPending}
                    className="relative overflow-hidden"
                  >
                    {formPending || imageUploadPending ? (
                      <span className="flex items-center">
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        {imageUploadPending
                          ? "Uploading Image..."
                          : "Creating Testimonial..."}
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <UserCheck className="mr-2 h-4 w-4" />
                        Add Testimonial
                      </span>
                    )}
                    <BorderBeam
                      size={40}
                      initialOffset={20}
                      className="from-transparent via-primary to-transparent opacity-70"
                      transition={{
                        type: "spring",
                        stiffness: 60,
                        damping: 20,
                      }}
                    />
                  </ConfettiButton>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

export default function TestimonialForm() {
  return (
    <DashboardLayout>
      <TestimonialFormPage />
    </DashboardLayout>
  );
}
