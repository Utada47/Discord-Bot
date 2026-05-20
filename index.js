require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    StringSelectMenuBuilder
} = require('discord.js');

// ======================================================
// CLIENT
// ======================================================

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// ======================================================
// CONFIG
// ======================================================

const TOKEN = process.env.TOKEN;

// CHANNEL
const INFORMATION_CHANNEL_ID = '1506668423852195880';
const ROLE_CHANNEL_ID = '1506660161719242782';
const FORM_CHANNEL_ID = '1506277756860629155';
const ANNOUNCEMENT_CHANNEL_ID = '1506280638678962319';

// ROLE
const STUDY_ROLE_ID = '1506276352360190075';

// ======================================================
// TRACKER MESSAGE
// ======================================================

let TRACKER_MESSAGE_ID = null;

// ======================================================
// ROLE MAP
// ======================================================

const MATERI_ROLE = {
    '📐 Algoritma dan Pemrograman': '1506655020744183872',
    '🗄️ Basis Data': '1506656246940434452',
    '💡 Elektronika Dasar': '1506656307946455080',
    '🌐 Jaringan Komputer': '1506656441459802152',
    '📱 Pemrograman Aplikasi Bergerak': '1506656504760107160',
    '☕ Pemrograman Berorientasi Objek': '1506656583592185946',
    '💻 Pemrograman Web': '1506656654652080189',
    '🎨 UI/UX': '1506656710952091780'
};

const ROLES = {
    student: '1506276352360190075',
    algorithm: '1506655020744183872',
    database: '1506656246940434452',
    electronics: '1506656307946455080',
    network: '1506656441459802152',
    mobiledev: '1506656504760107160',
    oop: '1506656583592185946',
    webdev: '1506656654652080189',
    uiux: '1506656710952091780'
};

// ======================================================
// HELPER
// ======================================================

function getRoleCount(guild, roleId) {

    const role = guild.roles.cache.get(roleId);

    if (!role) return 0;

    return role.members.size;
}

// ======================================================
// UPDATE TRACKER
// ======================================================

async function updateTracker() {

    try {

        const guild = client.guilds.cache.first();

        const roleChannel =
            await client.channels.fetch(
                ROLE_CHANNEL_ID
            );

        if (!TRACKER_MESSAGE_ID) {

            const messages =
                await roleChannel.messages.fetch({
                    limit: 20
                });

            const trackerMessage = messages.find(
                msg =>
                    msg.author.id === client.user.id &&
                    msg.embeds.length > 0 &&
                    msg.embeds[0]?.title ===
                    '📊 Study Tracker'
            );

            if (!trackerMessage) return;

            TRACKER_MESSAGE_ID =
                trackerMessage.id;
        }

        const message =
            await roleChannel.messages.fetch(
                TRACKER_MESSAGE_ID
            );

        const trackerEmbed =
            new EmbedBuilder()
                .setTitle('📊 Study Tracker')
                .setDescription(
                    `🎓 Students: ${getRoleCount(guild, ROLES.student)}\n\n` +

                    `📐 Algorithm: ${getRoleCount(guild, ROLES.algorithm)}\n` +
                    `🗄️ Database: ${getRoleCount(guild, ROLES.database)}\n` +
                    `💡 Electronics: ${getRoleCount(guild, ROLES.electronics)}\n` +
                    `🌐 Networking: ${getRoleCount(guild, ROLES.network)}\n` +
                    `📱 Mobile Development: ${getRoleCount(guild, ROLES.mobiledev)}\n` +
                    `☕ OOP: ${getRoleCount(guild, ROLES.oop)}\n` +
                    `💻 Web Development: ${getRoleCount(guild, ROLES.webdev)}\n` +
                    `🎨 UI/UX: ${getRoleCount(guild, ROLES.uiux)}`
                )
                .setColor('#5865F2')
                .setTimestamp();

        await message.edit({
            embeds: [trackerEmbed]
        });

    } catch (err) {

        console.error(
            'Tracker update error:',
            err
        );
    }
}

// ======================================================
// READY
// ======================================================

client.once(Events.ClientReady, async () => {

    console.log(`✅ Login sebagai ${client.user.tag}`);

    try {

        // ======================================================
        // INFORMATION CHANNEL
        // ======================================================

        const infoChannel =
            await client.channels.fetch(
                INFORMATION_CHANNEL_ID
            );

        const infoMessages =
            await infoChannel.messages.fetch({
                limit: 20
            });

        const existingInfo = infoMessages.find(
            msg =>
                msg.author.id === client.user.id &&
                msg.embeds.length > 0 &&
                msg.embeds[0]?.title ===
                '🎓 Welcome to Study Community'
        );

        if (!existingInfo) {

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('🎓 Welcome to Study Community')
                .setDescription(
                    'Server ini dibuat untuk belajar bersama,\n' +
                    'sharing materi, dan mengadakan sesi belajar.'
                )
                .setColor('#5865F2');

            const rulesEmbed = new EmbedBuilder()
                .setTitle('📜 Rules')
                .setDescription(
                    '• Hormati member lain\n' +
                    '• Dilarang spam\n' +
                    '• Dilarang toxic\n' +
                    '• Gunakan channel sesuai topik'
                )
                .setColor('#E67E22');

            const teacherEmbed = new EmbedBuilder()
                .setTitle('📝 Cara Menjadi Pengajar')
                .setDescription(
                    '1. Buka channel form pengajar\n' +
                    '2. Klik tombol Mengajar\n' +
                    '3. Pilih materi\n' +
                    '4. Isi form\n' +
                    '5. Announcement akan otomatis dibuat'
                )
                .setColor('#27AE60');

            await infoChannel.send({
                embeds: [
                    welcomeEmbed,
                    rulesEmbed,
                    teacherEmbed
                ]
            });

            console.log('✅ Information berhasil dikirim');
        }

        // ======================================================
        // ROLE CHANNEL
        // ======================================================

        const roleChannel =
            await client.channels.fetch(
                ROLE_CHANNEL_ID
            );

        const roleMessages =
            await roleChannel.messages.fetch({
                limit: 20
            });

        const existingRoleMessage = roleMessages.find(
            msg =>
                msg.author.id === client.user.id &&
                msg.content.includes(
                    'Choose Your Study Role'
                )
        );

        if (!existingRoleMessage) {

            const studentButton =
                new ButtonBuilder()
                    .setCustomId('become_student')
                    .setLabel('Become Student')
                    .setEmoji('🎓')
                    .setStyle(ButtonStyle.Success);

            const buttonRow =
                new ActionRowBuilder()
                    .addComponents(studentButton);

            const select =
                new StringSelectMenuBuilder()
                    .setCustomId('study_role')
                    .setPlaceholder(
                        'Pilih role study'
                    )
                    .setMinValues(1)
                    .setMaxValues(8)
                    .addOptions([
                        {
                            label: 'Algorithm',
                            value: 'algorithm',
                            emoji: '📐'
                        },
                        {
                            label: 'Database',
                            value: 'database',
                            emoji: '🗄️'
                        },
                        {
                            label: 'Electronics',
                            value: 'electronics',
                            emoji: '💡'
                        },
                        {
                            label: 'Networking',
                            value: 'network',
                            emoji: '🌐'
                        },
                        {
                            label: 'Mobile Development',
                            value: 'mobiledev',
                            emoji: '📱'
                        },
                        {
                            label: 'Object Oriented Programming',
                            value: 'oop',
                            emoji: '☕'
                        },
                        {
                            label: 'Web Development',
                            value: 'webdev',
                            emoji: '💻'
                        },
                        {
                            label: 'UI/UX Design',
                            value: 'uiux',
                            emoji: '🎨'
                        }
                    ]);

            const roleRow =
                new ActionRowBuilder()
                    .addComponents(select);

            const guild =
                client.guilds.cache.first();

            const trackerEmbed =
                new EmbedBuilder()
                    .setTitle('📊 Study Tracker')
                    .setDescription(
                        `🎓 Students: ${getRoleCount(guild, ROLES.student)}\n\n` +

                        `📐 Algorithm: ${getRoleCount(guild, ROLES.algorithm)}\n` +
                        `🗄️ Database: ${getRoleCount(guild, ROLES.database)}\n` +
                        `💡 Electronics: ${getRoleCount(guild, ROLES.electronics)}\n` +
                        `🌐 Networking: ${getRoleCount(guild, ROLES.network)}\n` +
                        `📱 Mobile Development: ${getRoleCount(guild, ROLES.mobiledev)}\n` +
                        `☕ OOP: ${getRoleCount(guild, ROLES.oop)}\n` +
                        `💻 Web Development: ${getRoleCount(guild, ROLES.webdev)}\n` +
                        `🎨 UI/UX: ${getRoleCount(guild, ROLES.uiux)}`
                    )
                    .setColor('#5865F2')
                    .setTimestamp();

            await roleChannel.send({
                content:
                    '## 🎓 Become Student\nKlik tombol di bawah untuk menjadi student.',
                components: [buttonRow]
            });

            await roleChannel.send({
                content:
                    '## 📚 Choose Your Study Role\nPilih peminatan yang ingin kamu ambil.',
                components: [roleRow]
            });

            const trackerMessage =
                await roleChannel.send({
                    embeds: [trackerEmbed]
                });

            TRACKER_MESSAGE_ID =
                trackerMessage.id;

            console.log('✅ Role system berhasil dikirim');
        }

        // ======================================================
        // FORM CHANNEL
        // ======================================================

        const formChannel =
            await client.channels.fetch(
                FORM_CHANNEL_ID
            );

        const formMessages =
            await formChannel.messages.fetch({
                limit: 20
            });

        const existingForm = formMessages.find(
            msg =>
                msg.author.id === client.user.id &&
                msg.content.includes(
                    'Form Pengajar'
                )
        );

        if (!existingForm) {

            const button =
                new ButtonBuilder()
                    .setCustomId('mengajar')
                    .setLabel('Mengajar')
                    .setStyle(
                        ButtonStyle.Primary
                    );

            const row =
                new ActionRowBuilder()
                    .addComponents(button);

            await formChannel.send({
                content:
                    '## 📚 Form Pengajar\nKlik tombol di bawah untuk membuat jadwal belajar.',
                components: [row]
            });

            console.log(
                '✅ Form pengajar berhasil dikirim'
            );
        }

    } catch (err) {

        console.error(err);
    }
});

// ======================================================
// INTERACTION
// ======================================================

client.on(
    Events.InteractionCreate,
    async interaction => {

        if (
            interaction.isButton() &&
            interaction.customId ===
            'become_student'
        ) {

            const member = interaction.member;

            if (
                member.roles.cache.has(
                    STUDY_ROLE_ID
                )
            ) {

                return interaction.reply({
                    content:
                        '✅ Kamu sudah memiliki role student.',
                    ephemeral: true
                });
            }

            await member.roles.add(
                STUDY_ROLE_ID
            );

            await updateTracker();

            return interaction.reply({
                content:
                    '🎓 Role student berhasil diberikan.',
                ephemeral: true
            });
        }

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId ===
            'study_role'
        ) {

            const member =
                interaction.member;

            for (const selected of interaction.values) {

                const roleId =
                    ROLES[selected];

                if (!roleId) continue;

                if (
                    member.roles.cache.has(
                        roleId
                    )
                ) {

                    await member.roles.remove(
                        roleId
                    );

                } else {

                    await member.roles.add(
                        roleId
                    );
                }
            }

            await updateTracker();

            return interaction.reply({
                content:
                    '✅ Role berhasil diperbarui.',
                ephemeral: true
            });
        }

        if (
            interaction.isButton() &&
            interaction.customId ===
            'mengajar'
        ) {

            const select =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        'pilih_materi'
                    )
                    .setPlaceholder(
                        'Pilih materi'
                    )
                    .addOptions([
                        {
                            label:
                                'Algoritma dan Pemrograman',
                            value:
                                '📐 Algoritma dan Pemrograman'
                        },
                        {
                            label: 'Basis Data',
                            value:
                                '🗄️ Basis Data'
                        },
                        {
                            label:
                                'Elektronika Dasar',
                            value:
                                '💡 Elektronika Dasar'
                        },
                        {
                            label:
                                'Jaringan Komputer',
                            value:
                                '🌐 Jaringan Komputer'
                        },
                        {
                            label:
                                'Pemrograman Aplikasi Bergerak',
                            value:
                                '📱 Pemrograman Aplikasi Bergerak'
                        },
                        {
                            label:
                                'Pemrograman Berorientasi Objek',
                            value:
                                '☕ Pemrograman Berorientasi Objek'
                        },
                        {
                            label:
                                'Pemrograman Web',
                            value:
                                '💻 Pemrograman Web'
                        },
                        {
                            label: 'UI/UX',
                            value: '🎨 UI/UX'
                        }
                    ]);

            const row =
                new ActionRowBuilder()
                    .addComponents(select);

            return interaction.reply({
                content:
                    'Silakan pilih materi:',
                components: [row],
                ephemeral: true
            });
        }

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId ===
            'pilih_materi'
        ) {

            const materiDipilih =
                interaction.values[0];

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `form_mengajar|${materiDipilih}`
                    )
                    .setTitle(
                        'Form Mengajar'
                    );

            const pengajar =
                new TextInputBuilder()
                    .setCustomId(
                        'pengajar'
                    )
                    .setLabel(
                        'Nama Pengajar'
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const jam =
                new TextInputBuilder()
                    .setCustomId('jam')
                    .setLabel(
                        'Jam Belajar'
                    )
                    .setPlaceholder(
                        'Contoh: 19:00'
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        pengajar
                    ),

                new ActionRowBuilder()
                    .addComponents(jam)
            );

            return interaction.showModal(
                modal
            );
        }

        if (
            interaction.isModalSubmit() &&
            interaction.customId.startsWith(
                'form_mengajar'
            )
        ) {

            const materi =
                interaction.customId.split(
                    '|'
                )[1];

            const pengajar =
                interaction.fields.getTextInputValue(
                    'pengajar'
                );

            const jam =
                interaction.fields.getTextInputValue(
                    'jam'
                );

            const materiRoleId =
                MATERI_ROLE[materi];

            const embed =
                new EmbedBuilder()
                    .setTitle(
                        '📚 Jadwal Belajar Baru'
                    )
                    .setDescription(
                        `👨‍🏫 **Pengajar:** ${pengajar}\n` +
                        `📖 **Materi:** ${materi}\n` +
                        `⏰ **Jam:** ${jam}`
                    )
                    .setColor('#5865F2')
                    .setTimestamp();

            try {

                const announcementChannel =
                    await client.channels.fetch(
                        ANNOUNCEMENT_CHANNEL_ID
                    );

                await announcementChannel.send({
                    content:
                        `<@&${STUDY_ROLE_ID}> <@&${materiRoleId}>`,
                    embeds: [embed]
                });

                return interaction.reply({
                    content:
                        '✅ Jadwal berhasil dikirim.',
                    ephemeral: true
                });

            } catch (err) {

                console.error(err);

                return interaction.reply({
                    content:
                        '❌ Gagal mengirim announcement.',
                    ephemeral: true
                });
            }
        }
    }
);

client.login(TOKEN);