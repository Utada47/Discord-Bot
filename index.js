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
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
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
const AUDIT_LOG_CHANNEL_ID = '1506897093082615818';

// ROLE
const STUDY_ROLE_ID = '1506276352360190075';

// ======================================================
// TRACKER MESSAGE
// ======================================================

let TRACKER_MESSAGE_ID = null;

// ======================================================
// WATCH LIST
// ======================================================

const WATCHED_USERS = [
    '1369161141586104381'
];

// user yang akan di tag
const OWNER_ID = '467731605004484608';

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
// GET ROLE COUNT
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
// Audit Log
// ====================================================== 

async function sendAuditLog(embed) {

    try {

        const channel =
            await client.channels.fetch(
                AUDIT_LOG_CHANNEL_ID
            );

        if (!channel) return;

        await channel.send({
            embeds: [embed]
        });

    } catch (err) {

        console.error(
            'Audit log error:',
            err
        );
    }
}

// ======================================================
// WATCH CHECK
// ======================================================

function isWatched(userId) {

    return WATCHED_USERS.includes(userId);
}

async function sendWatchedAlert(userId, action) {

    if (!isWatched(userId)) return;

    try {

        const channel =
            await client.channels.fetch(
                AUDIT_LOG_CHANNEL_ID
            );

        if (!channel) return;

        const user =
            await client.users.fetch(userId);

        await channel.send({
            content:
                `<@${OWNER_ID}> 🚨 WATCHED USER DETECTED\n\n` +
                `👤 User: ${user.tag}\n` +
                `🆔 ID: ${user.id}\n` +
                `⚠️ Action: ${action}`
        });

    } catch (err) {

        console.error(err);
    }
}

client.on(
    Events.GuildMemberUpdate,
    async () => {

        await updateTracker();
    }
);

client.on(
    Events.GuildMemberAdd,
    async member => {

        const embed =
            new EmbedBuilder()
                .setTitle('📥 Member Join')
                .setDescription(
                    `👤 ${member.user.tag}\n🆔 ${member.id}`
                )
                .setColor('#2ECC71')
                .setTimestamp();

        await sendAuditLog(embed);

    }
);

client.on(
    Events.GuildMemberRemove,
    async member => {

        const embed =
            new EmbedBuilder()
                .setTitle('📤 Member Leave')
                .setDescription(
                    `👤 ${member.user.tag}\n🆔 ${member.id}`
                )
                .setColor('#E74C3C')
                .setTimestamp();

        await sendAuditLog(embed);

    }
);

client.on(
    Events.VoiceStateUpdate,
    async (oldState, newState) => {

        const member =
            newState.member || oldState.member;

        // =========================================
        // JOIN VC
        // =========================================

        if (
            !oldState.channel &&
            newState.channel
        ) {

            const embed =
                new EmbedBuilder()
                    .setTitle('🔊 Voice Join')
                    .setDescription(
                        `👤 User: ${member.user.tag}\n` +
                        `📥 Channel: ${newState.channel.name}`
                    )
                    .setColor('#2ECC71')
                    .setTimestamp();

            await sendAuditLog(embed);

            await sendWatchedAlert(
                member.id,
                `Voice Join (${newState.channel.name})`
            );

            return;
        }

        // =========================================
        // LEAVE / DISCONNECT
        // =========================================

        if (
            oldState.channel &&
            !newState.channel
        ) {

            let moderator = null;

            try {

                // tunggu audit log discord update
                await new Promise(resolve =>
                    setTimeout(resolve, 3000)
                );

                const fetchedLogs =
                    await oldState.guild.fetchAuditLogs({
                        limit: 20
                    });

                const disconnectLog =
                    fetchedLogs.entries.find(log =>

                        log.action === 27 &&
                        log.target?.id === member.id &&
                        Date.now() - log.createdTimestamp < 15000
                    );

                if (disconnectLog) {

                    moderator =
                        disconnectLog.executor;
                }

            } catch (err) {

                console.error(err);
            }

            const embed =
                new EmbedBuilder()
                    .setTitle(
                        moderator
                            ? '⛔ Force Disconnect'
                            : '🔇 Voice Leave'
                    )
                    .setDescription(
                        `👤 Victim: ${member.user.tag}\n` +
                        `📤 Channel: ${oldState.channel.name}\n` +

                        (
                            moderator
                                ? `👮 Moderator: ${moderator.tag}`
                                : ''
                        )
                    )
                    .setColor(
                        moderator
                            ? '#E74C3C'
                            : '#E67E22'
                    )
                    .setTimestamp();

            await sendAuditLog(embed);

            await sendWatchedAlert(
                member.id,
                moderator
                    ? `Force Disconnect by ${moderator.tag}`
                    : `Voice Leave (${oldState.channel.name})`
            );

            return;
        }

        // =========================================
        // MOVE VC
        // =========================================

        if (
            oldState.channelId &&
            newState.channelId &&
            oldState.channelId !==
            newState.channelId
        ) {

            let moderator = null;

            try {

                await new Promise(resolve =>
                    setTimeout(resolve, 3000)
                );

                const fetchedLogs =
                    await newState.guild.fetchAuditLogs({
                        limit: 20
                    });

                const moveLog =
                    fetchedLogs.entries.find(log =>

                        log.action === 26 &&
                        log.target?.id === member.id &&
                        Date.now() - log.createdTimestamp < 15000
                    );

                if (moveLog) {

                    moderator =
                        moveLog.executor;
                }

            } catch (err) {

                console.error(err);
            }

            const embed =
                new EmbedBuilder()
                    .setTitle(
                        moderator
                            ? '🔁 Force Move'
                            : '🔁 Voice Move'
                    )
                    .setDescription(
                        `👤 Victim: ${member.user.tag}\n` +
                        `📤 From: ${oldState.channel.name}\n` +
                        `📥 To: ${newState.channel.name}\n` +

                        (
                            moderator
                                ? `👮 Moderator: ${moderator.tag}`
                                : ''
                        )
                    )
                    .setColor('#3498DB')
                    .setTimestamp();

            await sendAuditLog(embed);

            await sendWatchedAlert(
                member.id,
                moderator
                    ? `Force Move by ${moderator.tag}`
                    : `Voice Move`
            );

            return;
        }
    }
);

client.on(
    Events.MessageDelete,
    async message => {

        if (!message.guild) return;
        if (message.author?.bot) return;

        const embed =
            new EmbedBuilder()
                .setTitle('🗑️ Message Deleted')
                .setDescription(
                    `👤 ${message.author.tag}\n` +
                    `📍 ${message.channel}\n\n` +
                    `💬 ${message.content || 'No text'}`
                )
                .setColor('#E74C3C')
                .setTimestamp();

        await sendAuditLog(embed);
    }
);

client.on(
    Events.MessageUpdate,
    async (oldMessage, newMessage) => {

        if (!oldMessage.guild) return;
        if (oldMessage.author?.bot) return;

        if (
            oldMessage.content ===
            newMessage.content
        ) return;

        const embed =
            new EmbedBuilder()
                .setTitle('✏️ Message Edited')
                .setDescription(
                    `👤 ${oldMessage.author.tag}\n` +
                    `📍 ${oldMessage.channel}\n\n` +
                    `📄 Before:\n${oldMessage.content}\n\n` +
                    `📄 After:\n${newMessage.content}`
                )
                .setColor('#F1C40F')
                .setTimestamp();

        await sendAuditLog(embed);
    }
);

client.on(
    Events.GuildMemberUpdate,
    async (oldMember, newMember) => {

        const oldRoles =
            oldMember.roles.cache;

        const newRoles =
            newMember.roles.cache;

        const addedRoles =
            newRoles.filter(
                role => !oldRoles.has(role.id)
            );

        const removedRoles =
            oldRoles.filter(
                role => !newRoles.has(role.id)
            );

        if (addedRoles.size > 0) {

            addedRoles.forEach(async role => {

                const embed =
                    new EmbedBuilder()
                        .setTitle('➕ Role Added')
                        .setDescription(
                            `👤 ${newMember.user.tag}\n🎭 ${role.name}`
                        )
                        .setColor('#2ECC71')
                        .setTimestamp();

                await sendAuditLog(embed);
            });
        }

        if (removedRoles.size > 0) {

            removedRoles.forEach(async role => {

                const embed =
                    new EmbedBuilder()
                        .setTitle('➖ Role Removed')
                        .setDescription(
                            `👤 ${newMember.user.tag}\n🎭 ${role.name}`
                        )
                        .setColor('#E74C3C')
                        .setTimestamp();

                await sendAuditLog(embed);
            });
        }
    }
);

client.on(
    Events.GuildMemberUpdate,
    async (oldMember, newMember) => {

        if (
            oldMember.nickname !==
            newMember.nickname
        ) {

            const embed =
                new EmbedBuilder()
                    .setTitle('✏️ Nickname Changed')
                    .setDescription(
                        `👤 ${newMember.user.tag}\n` +
                        `📄 Before: ${oldMember.nickname || 'None'}\n` +
                        `📄 After: ${newMember.nickname || 'None'}`
                    )
                    .setColor('#3498DB')
                    .setTimestamp();

            await sendAuditLog(embed);
        }
    }
);

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
                '🎓 Welcome to CCA FIKOM UMI 2026'
        );

        if (!existingInfo) {

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('🎓 Welcome to CCA FIKOM UMI 2026')
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
                    '• Dilarang cepu\n' +
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
                    '5. Announcement otomatis dibuat'
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

            // BUTTON STUDENT

            const studentButton =
                new ButtonBuilder()
                    .setCustomId('become_student')
                    .setLabel('Become Student')
                    .setEmoji('🎓')
                    .setStyle(ButtonStyle.Success);

            const buttonRow =
                new ActionRowBuilder()
                    .addComponents(studentButton);

            // DROPDOWN ROLE

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

            // TRACKER

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

        // ======================================================
        // BECOME STUDENT
        // ======================================================

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

        // ======================================================
        // SELF ROLE
        // ======================================================

        if (
            interaction.isStringSelectMenu() &&
            interaction.customId === 'study_role'
        ) {

            await interaction.deferReply({
                flags: 64
            });

            const member = interaction.member;

            for (const selected of interaction.values) {

                const roleId = ROLES[selected];

                if (!roleId) continue;

                if (
                    member.roles.cache.has(roleId)
                ) {

                    await member.roles.remove(roleId);

                } else {

                    await member.roles.add(roleId);
                }
            }

            await updateTracker();

            await interaction.editReply({
                content: '✅ Role berhasil diperbarui.'
            });
        }

        // ======================================================
        // BUTTON MENGAJAR
        // ======================================================

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

        // ======================================================
        // DROPDOWN MATERI
        // ======================================================

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

        // ======================================================
        // SUBMIT FORM
        // ======================================================

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