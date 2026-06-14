import fs from 'fs';
import path from 'path';
import resumeUtils from './resume-parsing-utils';

async function parseLocalResume() {
    try {
        console.log('==================================================');
        console.log('🚀 INITIALIZING RESUME PARSING UTILS RUNNER');
        console.log('==================================================\n');

        // 1. PDF File ka path target karo
        const fileName = 'my_resume.pdf';
        const filePath = path.join(__dirname, fileName);

        // Check karo ki file sach mein wahan maujood hai ya nahi
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Error: "${fileName}" file is folder mein nahi mili!`);
            console.log('💡 Fix: Pehle check karo ki aapne file sahi folder mein dali hai.\n');
            return;
        }

        // 2. File ko Buffer mein convert karo
        console.log(`⏳ Reading binary data from: ${fileName}...`);
        const fileBuffer = fs.readFileSync(filePath);

        // 3. Text Extraction flow ko trigger karo
        console.log('⏳ Extracting and normalizing text via pdf-parse...');
        const extractedText = await resumeUtils.extractTextFromResume(fileBuffer, fileName);

        console.log('\n✅ EXTRACTION SUCCESSFUL!');
        console.log(`📊 Total Characters Parsed: ${extractedText.length}`);
        console.log('--------------------------------------------------');
        console.log('📄 COMPLETE RAW EXTRACTED TEXT:');
        console.log('--------------------------------------------------');
        console.log(extractedText);
        console.log('--------------------------------------------------\n');

        // 4. Regex Analytics Methods execute karo
        console.log('🔍 RUNNING REGEX INSIGHTS ENGINE...');
        console.log('--------------------------------------------------');

        // Email extraction
        const emails = resumeUtils.extractEmails(extractedText);
        console.log('📧 Extracted Emails:', emails.length > 0 ? emails : 'No emails found');

        // Phone extraction
        const phoneNumbers = resumeUtils.extractPhoneNumbers(extractedText);
        console.log('📞 Extracted Phones:', phoneNumbers.length > 0 ? phoneNumbers : 'No phone numbers found');

        // Skill matching (is list ko apne hisab se chota-bada kar sakte ho)
        const commonSkills = ['C++', 'Python', 'Java', 'JavaScript', 'Node.js', 'React', 'SQL', 'MongoDB', 'Git', 'Docker'];
        const matchedSkills = resumeUtils.extractSkills(extractedText, commonSkills);
        console.log('🛠️  Matched Skills:', matchedSkills.length > 0 ? matchedSkills : 'No matching skills found from the provided checklist');

        // Experience estimation
        const experienceYears = resumeUtils.extractYearsOfExperience(extractedText);
        console.log(`💼 Estimated Experience: ${experienceYears} Year(s)`);

        console.log('--------------------------------------------------\n');

        // 5. AI Parsing execute karo (Whole Resume Parsing) - Disabled because of API limit
        // console.log('🤖 RUNNING AI RESUME PARSER (Gemini)...');
        // console.log('--------------------------------------------------');
        // const aiParsedData = await resumeUtils.parseResumeWithAI(extractedText);
        // console.log(JSON.stringify(aiParsedData, null, 2));

        console.log('--------------------------------------------------');
        console.log('🎉 PARSING PROCESS COMPLETED SUCCESSFULLY!');
        console.log('==================================================');

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR DURING EXECUTION:');
        console.error(error);
    }
}

// Function call karo execute karne ke liye
parseLocalResume();