'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UserProfile,
  userProfileSchema,
  workExperienceSchema,
  educationSchema,
  projectSchema,
  certificationSchema,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { parseResumeAction } from '@/lib/actions';
import {
  Briefcase,
  GraduationCap,
  Lightbulb,
  Award,
  Upload,
  PlusCircle,
  X,
  User,
  Tags,
} from 'lucide-react';

interface UserProfileFormProps {
  onProfileChange: (profile: UserProfile) => void;
}

export function UserProfileForm({ onProfileChange }: UserProfileFormProps) {
  const [isParsing, startParsing] = useTransition();
  const { toast } = useToast();
  const [skillInput, setSkillInput] = useState('');

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      experiences: [],
      education: [],
      projects: [],
      certifications: [],
      skills: [],
    },
  });

  const { fields: experiences, append: appendExperience, remove: removeExperience, replace: replaceExperiences } = useFieldArray({ control: form.control, name: 'experiences' });
  const { fields: educations, append: appendEducation, remove: removeEducation, replace: replaceEducations } = useFieldArray({ control: form.control, name: 'education' });
  const { fields: projects, append: appendProject, remove: removeProject, replace: replaceProjects } = useFieldArray({ control: form.control, name: 'projects' });
  const { fields: certifications, append: appendCertification, remove: removeCertification, replace: replaceCertifications } = useFieldArray({ control: form.control, name: 'certifications' });
  const skills = form.watch('skills');

  useEffect(() => {
    const subscription = form.watch((value) => {
      onProfileChange(value as UserProfile);
    });
    return () => subscription.unsubscribe();
  }, [form, onProfileChange]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey && !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      toast({ variant: 'destructive', title: 'API Key Missing', description: 'Please set your Gemini API key in the header.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ variant: 'destructive', title: 'File too large', description: 'Please upload a file smaller than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUri = reader.result as string;
      startParsing(async () => {
        try {
          toast({ title: 'Parsing resume...', description: 'Please wait while we extract your information.' });
          const parsedData = await parseResumeAction(dataUri);
          
          form.reset({
            name: parsedData.name,
            email: parsedData.email,
            phone: parsedData.phone,
            skills: parsedData.skills || [],
          });

          // RHF's `reset` doesn't work well with `useFieldArray`, so we use `replace`
          replaceExperiences(parsedData.experience || []);
          replaceEducations(parsedData.education || []);
          replaceProjects(parsedData.projects || []);
          replaceCertifications(parsedData.certifications || []);
          
          toast({ title: 'Success!', description: 'Your resume has been parsed.' });
        } catch (error) {
          console.error("Parsing failed:", error);
          toast({ variant: 'destructive', title: 'Parsing failed', description: error instanceof Error ? error.message : 'Could not parse resume. Please check your API key and file, then try again.' });
        }
      });
    };
  };

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      form.setValue('skills', [...skills, skillInput]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    form.setValue('skills', skills.filter(skill => skill !== skillToRemove));
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-primary" />
                <CardTitle className="font-headline">Your Professional Profile</CardTitle>
            </div>
            <label htmlFor="resume-upload" className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{isParsing ? 'Parsing...' : 'Parse Resume'}</span>
              <Input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" disabled={isParsing} />
            </label>
        </div>
        <CardDescription>Enter your details below, or upload a resume to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="e.g. jane.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="e.g. (123) 456-7890" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
              {/* Work Experience */}
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-lg font-medium"><div className="flex items-center gap-2"><Briefcase className="w-5 h-5"/> Work Experience</div></AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {experiences.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-2">
                      <FormField control={form.control} name={`experiences.${index}.jobTitle`} render={({ field }) => (
                         <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`experiences.${index}.company`} render={({ field }) => (
                         <FormItem><FormLabel>Company</FormLabel><FormControl><Input placeholder="Tech Corp" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name={`experiences.${index}.startDate`} render={({ field }) => (
                            <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="text" placeholder="Jan 2020" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`experiences.${index}.endDate`} render={({ field }) => (
                           <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="text" placeholder="Present" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <FormField control={form.control} name={`experiences.${index}.description`} render={({ field }) => (
                         <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your responsibilities and achievements..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeExperience(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendExperience(workExperienceSchema.parse({}))}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
                </AccordionContent>
              </AccordionItem>
              
              {/* Education */}
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-lg font-medium"><div className="flex items-center gap-2"><GraduationCap className="w-5 h-5"/> Education</div></AccordionTrigger>
                <AccordionContent className="space-y-4">
                   {educations.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-2">
                      <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => (
                         <FormItem><FormLabel>Institution</FormLabel><FormControl><Input placeholder="University of Technology" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => (
                         <FormItem><FormLabel>Degree</FormLabel><FormControl><Input placeholder="Bachelor of Science" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField control={form.control} name={`education.${index}.fieldOfStudy`} render={({ field }) => (
                         <FormItem><FormLabel>Field of Study</FormLabel><FormControl><Input placeholder="Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField control={form.control} name={`education.${index}.graduationDate`} render={({ field }) => (
                         <FormItem><FormLabel>Graduation Date</FormLabel><FormControl><Input placeholder="May 2019" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEducation(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendEducation(educationSchema.parse({}))}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
                </AccordionContent>
              </AccordionItem>

              {/* Skills */}
              <AccordionItem value="item-3">
                 <AccordionTrigger className="text-lg font-medium"><div className="flex items-center gap-2"><Tags className="w-5 h-5"/> Skills</div></AccordionTrigger>
                 <AccordionContent>
                    <div className="flex items-center gap-2 mb-4">
                       <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="e.g. React" />
                       <Button type="button" onClick={addSkill}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {skills.map(skill => (
                          <Badge key={skill} variant="secondary" className="pl-3 pr-2 py-1 text-sm">
                             {skill}
                             <button type="button" onClick={() => removeSkill(skill)} className="ml-2 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                             </button>
                          </Badge>
                       ))}
                    </div>
                 </AccordionContent>
              </AccordionItem>
              
              {/* Projects */}
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-lg font-medium"><div className="flex items-center gap-2"><Lightbulb className="w-5 h-5"/> Projects</div></AccordionTrigger>
                 <AccordionContent className="space-y-4">
                   {projects.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-2">
                      <FormField control={form.control} name={`projects.${index}.name`} render={({ field }) => (
                         <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input placeholder="My Awesome App" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`projects.${index}.description`} render={({ field }) => (
                         <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A short description of your project..." {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                       <FormField control={form.control} name={`projects.${index}.url`} render={({ field }) => (
                         <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://github.com/user/repo" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeProject(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendProject(projectSchema.parse({}))}><PlusCircle className="mr-2 h-4 w-4" /> Add Project</Button>
                </AccordionContent>
              </AccordionItem>

              {/* Certifications */}
              <AccordionItem value="item-5">
                 <AccordionTrigger className="text-lg font-medium"><div className="flex items-center gap-2"><Award className="w-5 h-5"/> Certifications</div></AccordionTrigger>
                 <AccordionContent className="space-y-4">
                   {certifications.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg relative space-y-2">
                      <FormField control={form.control} name={`certifications.${index}.name`} render={({ field }) => (
                         <FormItem><FormLabel>Certification Name</FormLabel><FormControl><Input placeholder="Certified Cloud Practitioner" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`certifications.${index}.issuingOrganization`} render={({ field }) => (
                         <FormItem><FormLabel>Issuing Organization</FormLabel><FormControl><Input placeholder="Amazon Web Services" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name={`certifications.${index}.dateEarned`} render={({ field }) => (
                         <FormItem><FormLabel>Date Earned</FormLabel><FormControl><Input placeholder="June 2023" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeCertification(index)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendCertification(certificationSchema.parse({}))}><PlusCircle className="mr-2 h-4 w-4" /> Add Certification</Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
