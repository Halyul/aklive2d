import pathlib
import json
import shutil

TransformMode = [
    "normal",
    "onlyTranslation",
    "noRotationOrReflection", 
    "noScale", 
    "noScaleOrReflection"
]

BlendMode = [
    "normal",
    "additive",
    "multiply",
    "screen"
]

PositionMode = [
    "fixed",
    "percent"
]

SpacingMode = [
    "length", 
    "fixed", 
    "percent"
]

RotateMode = [
    "tangent", 
    "chain", 
    "chainScale"
]

AttachmentType = [
    "region", 
    "boundingbox", 
    "mesh", 
    "linkedmesh", 
    "path", 
    "point", 
    "clipping"
]

BONE_ROTATE = 0
BONE_TRANSLATE = 1
BONE_SCALE = 2
BONE_SHEAR = 3

SLOT_ATTACHMENT = 0
SLOT_COLOR = 1
SLOT_TWO_COLOR = 2

PATH_POSITION = 0
PATH_SPACING = 1
PATH_MIX = 2

CURVE_LINEAR = 0
CURVE_STEPPED = 1
CURVE_BEZIER = 2

class SkeletonBinary:

    def __init__(self, file_path, save_path, use_skel, scale=1):
        if file_path.strip().endswith(".skel") is False:
            file_path += ".skel"
            file_path = pathlib.Path.cwd().joinpath(file_path)
        if save_path.strip().endswith(".json") is False or save_path.strip().endswith(".skel") is False:
            if use_skel is True:
                save_path += ".skel"
            else:
                save_path += ".json"
            save_path = pathlib.Path.cwd().joinpath(save_path)

        if use_skel is True:
            shutil.copyfile(
                file_path,
                save_path
            )
            return
        
        self.index = 0
        self.scale = scale
        self.dict = dict()
        try:
            with open(file_path, "rb") as f:
                self.binaryData = f.read()
            self.readSkeletonData()

            with open(save_path, "w") as f:
                json.dump(self.dict, f)
        except Exception as e:
            print(e)

    def readSkeletonData(self):
        self.dict["skeleton"] = dict()
        self.dict["skeleton"]["hash"] = self.readString()
        if len(self.dict["skeleton"]["hash"]) == 0:
            self.dict["skeleton"]["hash"] = None
        self.dict["skeleton"]["spine"] = self.readString()
        if len(self.dict["skeleton"]["spine"]) == 0:
            self.dict["skeleton"]["spine"] = None
        self.dict["skeleton"]["width"] = self.readFloat()
        self.dict["skeleton"]["height"] = self.readFloat()

        nonessential = self.readBoolean()

        if nonessential is True:
            self.dict["skeleton"]["fps"] = self.readFloat()
            self.dict["skeleton"]["images"] = self.readString()
            if len(self.dict["skeleton"]["images"]) == 0:
                self.dict["skeleton"]["images"] = None

        # Bones.
        self.dict["bones"] = list()
        for i in range(self.readInt(True)):
            name = self.readString()
            if (i == 0):
                parent = None
            else:
                parent = self.dict["bones"][self.readInt(True)]["name"]
            data = dict(
                name=name,
                parent=parent,
                rotation=self.readFloat(),
                x=self.readFloat() * self.scale,
                y=self.readFloat() * self.scale,
                scaleX=self.readFloat(),
                scaleY=self.readFloat(),
                shearX=self.readFloat(),
                shearY=self.readFloat(),
                length=self.readFloat() * self.scale,
                transform=TransformMode[self.readInt(True)]
            )
            if nonessential is True:
                data["color"] = self.rgba8888ToColor(self.readInt())
            self.dict["bones"].append(data)
        
        # Slots.
        self.dict["slots"] = list()
        for i in range(self.readInt(True)):
            slotName = self.readString()
            boneData = self.dict["bones"][self.readInt(True)]["name"]
            data = dict(
                name=slotName,
                bone=boneData,
                color=self.rgba8888ToColor(self.readInt())[2:],
            )
            # not working for dyn_illust_char_1012_skadi2.skel
            # darkColor = self.readInt()
            # if (darkColor != -1):
            #     data["dark"] = self.rgba888ToColor(darkColor)[2:]

            data["attachment"] = self.readString()
            
            data["blend"] = BlendMode[self.readInt(True)]
            self.dict["slots"].append(data)
        
        # IK constraints.
        self.dict["ik"] = list()
        for i in range(self.readInt(True)):
            data = dict(
                name=self.readString(),
                order=self.readInt(True)
            )
            data["bones"] = list()
            for j in range(self.readInt(True)):
                data["bones"].append(self.dict["bones"][self.readInt(True)]["name"])
            data["target"] = self.dict["bones"][self.readInt(True)]["name"]
            data["mix"] = self.readFloat()
            data["bendPositive"] = self.readBoolean()
            self.dict["ik"].append(data)

        # Transform constraints.
        self.dict["transform"] = list()
        for i in range(self.readInt(True)):
            data = dict(
                name=self.readString(),
                order=self.readInt(True)
            )
            data["bones"] = list()
            for j in range(self.readInt(True)):
                data["bones"].append(self.dict["bones"][self.readInt(True)]["name"])
            data["target"] = self.dict["bones"][self.readInt(True)]["name"]
            # not working for dyn_illust_char_1012_skadi2.skel
            # data["local"] = self.readBoolean()
            # data["relative"] = self.readBoolean()
            data["rotation"] = self.readFloat()
            data["x"] = self.readFloat() * self.scale
            data["y"] = self.readFloat() * self.scale
            data["scaleX"] = self.readFloat()
            data["scaleY"] = self.readFloat()
            data["shearY"] = self.readFloat()
            data["rotateMix"] = self.readFloat()
            data["translateMix"] = self.readFloat()
            data["scaleMix"] = self.readFloat()
            data["shearMix"] = self.readFloat()
            self.dict["transform"].append(data)
        
        # Path constraints.
        self.dict["path"] = list()
        for i in range(self.readInt(True)):
            data = dict(
                name=self.readString(),
                order=self.readInt(True),
                bones=list()
            )
            for j in range(self.readInt(True)):
                data["bones"].append(self.dict["bones"][self.readInt(True)]["name"])
            data["target"] = self.dict["slots"][self.readInt(True)]["name"]
            data["positionMode"] = PositionMode[self.readInt(True)]
            data["spacingMode"] = SpacingMode[self.readInt(True)]
            data["rotateMode"] = RotateMode[self.readInt(True)]
            data["rotation"] = self.readFloat()
            data["position"] = self.readFloat()
            if data["positionMode"] == "fixed":
                data["position"] *= self.scale
            data["spacing"] = self.readFloat()
            if data["spacingMode"] == "length" or data["spacingMode"] == "fixed":
                data["spacing"] *= self.scale
            data["rotateMix"] = self.readFloat()
            data["translateMix"] = self.readFloat()
            self.dict["path"].append(data)
        
        # Default skin.
        self.dict["skins"] = dict()
        self.dict["skinNames"] = list()
        defaultSkin = self.readSkin("default", nonessential)
        if defaultSkin is not None:
            self.dict["skins"]["default"] = defaultSkin
            self.dict["skinNames"].append("default")
        
        # Skins.
        for i in range(self.readInt(True)):
            skinName = self.readString()
            self.dict["skins"][skinName] = self.readSkin(skinName, nonessential)
            self.dict["skinNames"].append(skinName)
        
        # Events.
        self.dict["events"] = list()
        for i in range(self.readInt(True)):
            self.dict["events"].append(
                dict(
                    name=self.readString(),
                    int=self.readInt(False),
                    float=self.readFloat(),
                    string=self.readString()
                )
            )
        
        # Animations.
        self.dict["animations"] = dict()
        for i in range(self.readInt(True)):
            animationName = self.readString()
            animation = self.readAnimation(animationName)
            self.dict["animations"][animationName] = animation

    def readSkin(self, skinName, nonessential):
        skin = dict()
        slotCount = self.readInt(True)
        if slotCount == 0:
            return None
        for i in range(slotCount):
            slotIndex = self.readInt(True)
            slot = dict()
            for j in range(self.readInt(True)):
                name = self.readString()
                attachment = self.readAttachment(slotIndex, name, nonessential)
                if attachment is not None:
                    slot[name] = attachment
            skin[self.dict["slots"][slotIndex]["name"]] = slot
        return skin
    
    def readAttachment(self, slotIndex, attachmentName, nonessential):
        name = self.readString()
        if (name == None):
            name = attachmentName
        type = AttachmentType[self.read()]
        if type == "region":
            path = self.readString()
            rotation = self.readFloat()
            x = self.readFloat()
            y = self.readFloat()
            scaleX = self.readFloat()
            scaleY = self.readFloat()
            width = self.readFloat()
            height = self.readFloat()
            color = self.rgba8888ToColor(self.readInt())[2:]
            if path == None:
                path = name
            return dict(
                path=path,
                x=x,
                y=y,
                scaleX=scaleX,
                scaleY=scaleY,
                rotation=rotation,
                width=width,
                height=height,
                color=color,
                name=name,
                type=type
            )
        elif type == "boundingbox":
            vertexCount = self.readInt(True)
            vertices = self.readVertices(vertexCount)
            if nonessential is True:
                color = self.rgba8888ToColor(self.readInt())[2:]
            else:
                color = "00000000"
            return dict(
                vertexCount=vertexCount,
                vertices=vertices,
                color=color,
                name=name,
                type=type
            )
        elif type == "mesh":
            path = self.readString()
            color = self.rgba8888ToColor(self.readInt())[2:]
            vertexCount = self.readInt(True)
            uvs = self.readFloatArray(vertexCount << 1, 1)
            triangles = self.readShortArray()
            vertices = self.readVertices(vertexCount)
            hull = self.readInt(True)
            edges = None
            width = 0
            height = 0
            if nonessential is True:
                edges = self.readShortArray()
                width = self.readFloat()
                height = self.readFloat()
            if path == None:
                path = name
            return dict(
                path=path,
                color=color,
                width=width,
                height=height,
                uvs=uvs,
                triangles=triangles,
                hull=hull,
                edges=edges,
                vertices=vertices,
                name=name,
                type=type
            )
        elif type == "linkedmesh":
            path = self.readString()
            color = self.rgba8888ToColor(self.readInt())[2:]
            skin = self.readString()
            parent = self.readString()
            deform = self.readBoolean()
            width = 0
            height = 0
            if nonessential is True:
                width = self.readFloat()
                height = self.readFloat()
            if path == None:
                path = name
            return dict(
                path=path,
                color=color,
                skin=skin,
                parent=parent,
                deform=deform,
                width=width,
                height=height,
                name=name,
                type=type
            )
        elif type == "path":
            closed = self.readBoolean()
            constantSpeed = self.readBoolean()
            vertexCount = self.readInt(True)
            vertices = self.readVertices(vertexCount)
            lengths = [0] * int(vertexCount / 3)
            for i in range(len(lengths)):
                lengths[i] = self.readFloat() * self.scale
            if nonessential is True:
                color = self.rgba8888ToColor(self.readInt())[2:]
            else:
                color = "00000000"
            return dict(
                closed=closed,
                constantSpeed=constantSpeed,
                vertexCount=vertexCount,
                vertices=vertices,
                lengths=lengths,
                color=color,
                name=name,
                type=type
            )
        elif type == "point":
            rotation = self.readFloat()
            x = self.readFloat()
            y = self.readFloat()
            if nonessential is True:
                color = self.rgba8888ToColor(self.readInt())[2:]
            else:
                color = "00000000"
            return dict(
                rotation=rotation,
                x=x,
                y=y,
                color=color,
                name=name,
                type=type
            )
        elif type == "clipping":
            end = self.readInt(True)
            vertexCount = self.readInt(True)
            vertices = self.readVertices(vertexCount)
            if nonessential is True:
                color = self.rgba8888ToColor(self.readInt())[2:]
            else:
                color = "00000000"
            return dict(
                end=end,
                vertexCount=vertexCount,
                vertices=vertices,
                color=color,
                name=name,
                type=type
            )
        return None

    def readVertices(self, vertexCount):
        verticesLength = vertexCount << 1
        if self.readBoolean() is False:
            return self.readFloatArray(verticesLength, self.scale)
        bonesArray = []
        for i in range(vertexCount):
            boneCount = self.readInt(True)
            bonesArray.append(boneCount)
            for j in range(boneCount):
                bonesArray.append(self.readInt(True))
                bonesArray.append(self.readFloat() * self.scale)
                bonesArray.append(self.readFloat() * self.scale)
                bonesArray.append(self.readFloat())
        return bonesArray

    def readAnimation(self, name):
        animation = dict()
        duration = 0
        # Slot timelines.
        slots = dict()
        for i in range(self.readInt(True)):
            slotIndex = self.readInt(True)
            slotMap = dict()
            for j in range(self.readInt(True)):
                timelineType = self.read()
                frameCount = self.readInt(True)
                timeline = [None] * frameCount
                if timelineType == SLOT_ATTACHMENT:
                    for frameIndex in range(frameCount):
                        e = dict()
                        e["time"] = self.readFloat()
                        e["name"] = self.readString()
                        timeline[frameIndex] = e
                    slotMap["attachment"] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
                elif timelineType == SLOT_COLOR:
                    for frameIndex in range(frameCount):
                        e = dict()
                        e["time"] = self.readFloat()
                        e["color"] = self.rgba8888ToColor(self.readInt())[2:]
                        timeline[frameIndex] = e
                        if (frameIndex < frameCount - 1):
                            self.readCurve(frameIndex, timeline)
                    slotMap["color"] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
                elif timelineType == SLOT_TWO_COLOR:
                    for frameIndex in range(frameCount):
                        e = dict()
                        e["time"] = self.readFloat()
                        e["light"] = self.rgba8888ToColor(self.readInt())[2:]
                        e["dark"] = self.rgba888ToColor(self.readInt)[2:]
                        timeline[frameIndex] = e
                        if (frameIndex < frameCount - 1):
                            self.readCurve(frameIndex, timeline)
                    slotMap["twoColor"] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
            slots[self.dict["slots"][slotIndex]["name"]] = slotMap
        animation["slots"] = slots

        # Bone timelines.
        bones = dict()
        for i in range(self.readInt(True)):
            boneIndex = self.readInt(True)
            boneMap = dict()
            for j in range(self.readInt(True)):
                timelineType = self.read()
                frameCount = self.readInt(True)
                timeline = [None] * frameCount
                if timelineType == BONE_ROTATE:
                    for frameIndex in range(frameCount):
                        e = dict()
                        e["time"] = self.readFloat()
                        e["angle"] = self.readFloat()
                        timeline[frameIndex] = e
                        if (frameIndex < frameCount - 1):
                            self.readCurve(frameIndex, timeline)
                    boneMap["rotate"] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
                elif timelineType == BONE_TRANSLATE or timelineType == BONE_SCALE or timelineType == BONE_SHEAR:
                    timelineScale = 1
                    if timelineType == BONE_TRANSLATE:
                        timelineScale = self.scale
                    for frameIndex in range(frameCount):
                        e = dict()
                        e["time"] = self.readFloat()
                        e["x"] = self.readFloat() * timelineScale
                        e["y"] = self.readFloat()  * timelineScale
                        timeline[frameIndex] = e
                        if (frameIndex < frameCount - 1):
                            self.readCurve(frameIndex, timeline)
                    if timelineType == BONE_TRANSLATE:
                        boneMap["translate"] = timeline
                    elif timelineType == BONE_SCALE:
                        boneMap["scale"] = timeline
                    else:
                        boneMap["shear"] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
            bones[self.dict["bones"][boneIndex]["name"]] = boneMap
        animation["bones"] = bones

        # IK constraint timelines.
        iks = dict()
        a = self.readInt(True)
        for i in range(a):
            ikIndex = self.readInt(True)
            frameCount = self.readInt(True)
            timeline = [None] * frameCount
            for frameIndex in range(frameCount):
                e = dict()
                e["time"] = self.readFloat()
                e["mix"] = self.readFloat()
                e["bendPositive"] = self.readBoolean()
                timeline[frameIndex] = e
                if (frameIndex < frameCount - 1):
                    self.readCurve(frameIndex, timeline)
            iks[self.dict["ik"][ikIndex]["name"]] = timeline
            duration = max(duration, timeline[frameCount - 1]["time"])
        animation["ik"] = iks

        # Transform constraint timelines.
        transforms = dict()
        for i in range(self.readInt(True)):
            transformIndex = self.readInt(True)
            frameCount = self.readInt(True)
            timeline = [None] * frameCount
            for frameIndex in range(frameCount):
                e = dict()
                e["time"] = self.readFloat()
                e["rotateMix"] = self.readFloat()
                e["translateMix"] = self.readFloat()
                e["scaleMix"] = self.readFloat()
                e["shearMix"] = self.readFloat()
                timeline[frameIndex] = e
                if (frameIndex < frameCount - 1):
                    self.readCurve(frameIndex, timeline)
            transforms[self.dict["transform"][transformIndex]["name"]] = timeline
            duration = max(duration, timeline[frameCount - 1]["time"])
        animation["transform"] = transforms

        # Path constraint timelines.
        paths = dict()
        for i in range(self.readInt(True)):
            pathIndex = self.readInt(True)
            data = self.dict["path"][pathIndex]
            pathMap = dict()
            for j in range(self.readInt(True)):
                timelineType = self.read()
                frameCount = self.readInt(True)
                timeline = [None] * frameCount
                if timelineType == PATH_POSITION or timelineType == PATH_SPACING:
                    timelineScale = 1
                    if timelineType == PATH_SPACING:
                        if data["spacingMode"] == "length" or data["spacingMode"] == "fixed":
                            timelineScale = self.scale
                    else:
                        if data["positionMode"] == "fixed":
                            timelineScale = self.scale
                    for frameIndex in range(frameCount):
                        e = dict()
                        e["time"] = self.readFloat()
                        e["position"] = self.readFloat() * timelineScale
                        timeline[frameIndex] = e
                        if (frameIndex < frameCount - 1):
                            self.readCurve(frameIndex, timeline)
                    if timelineType == PATH_POSITION:
                        pathMap["position"] = timeline
                    else:
                        pathMap["spacing"] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
                elif timelineType == PATH_MIX:
                    for frameIndex in range(frameCount):
                        timeline[frameIndex]["time"] = self.readFloat()
                        timeline[frameIndex]["rotateMix"] = self.readFloat()
                        timeline[frameIndex]["translateMix"] = self.readFloat()
                        self.readCurve(frameIndex, timeline)
                    pathMap["mix"] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
            paths[self.dict["path"][pathIndex]["name"]] = pathMap
        animation["paths"] = paths

        # Deform timelines.
        deformDict = dict()
        for i in range(self.readInt(True)):
            skinName = self.dict["skinNames"][self.readInt(True)]
            skin = self.dict["skins"][skinName]
            if skin == None:
                raise LookupError("Skin not found")
            deformMap = dict()
            for j in range(self.readInt(True)):
                slotIndex = self.readInt(True)
                slot = self.dict["slots"][slotIndex]
                for k in range(self.readInt(True)):
                    attachmentName = self.readString()
                    attachment = dict()
                    
                    frameCount = self.readInt(True)
                    timeline = [None] * frameCount
                    for frameIndex in range(frameCount):
                        time = self.readFloat()
                        end = self.readInt(True)
                        e = dict()
                        e["time"] = time
                        if end != 0:
                            deform = []
                            start = self.readInt(True)
                            end += start
                            if (self.scale == 1):
                                for v in range(start, end):
                                    deform.append(self.readFloat())
                            else:
                                for v in range(start, end):
                                    deform.append(self.readFloat() * self.scale)
                            e["vertices"] = deform
                            e["offset"] = start
                        timeline[frameIndex] = e
                        if frameIndex < frameCount - 1:
                            self.readCurve(frameIndex, timeline)
                    attachment[attachmentName] = timeline
                    duration = max(duration, timeline[frameCount - 1]["time"])
                deformMap[slot["name"]] = attachment
            deformDict[skinName] = deformMap
        animation["deform"] = deformDict

        # Draw order timeline.
        drawOrderCount = self.readInt(True)
        if (drawOrderCount > 0):
            slotCount = len(self.dict["slots"])
            drawOrders = [None] * drawOrderCount
            for i in range(drawOrderCount):
                drawOrderMap = dict()
                time = self.readFloat()
                offsetCount = self.readInt(True)
                offsets = [None] * offsetCount
                for j in range(offsetCount):
                    slotIndex = self.readInt(True)
                    e = dict()
                    e["slot"] = self.dict["slots"][slotIndex]["name"]
                    e["offset"] = self.readInt(True)
                    offsets[j] = e
                drawOrderMap["time"] = time
                drawOrderMap["offsets"] = offsets
                drawOrders[i] = drawOrderMap
            animation["drawOrder"] = drawOrders
            duration = max(duration, drawOrders[drawOrderCount - 1]["time"])
        
        # Event timeline.
        eventCount = self.readInt(True)
        if (eventCount > 0):
            timeline = [None] * eventCount
            for i in range(eventCount):
                time = self.readFloat()
                eventData = self.dict["events"][self.readInt(True)]
                event = dict(
                    int=self.readInt(False),
                    name=eventData["name"],
                    float=self.readFloat(),
                    time=time
                )
                if self.readBoolean() is True:
                    event["string"] = self.readString()
                else:
                    event["string"] = eventData["string"]
                timeline[i] = event
            animation["events"] = timeline 
            duration = max(duration, timeline[eventCount - 1]["time"])
        return animation
    
    def readCurve(self, frameIndex, timeline):
        case = self.read()
        if case == CURVE_LINEAR:
            timeline[frameIndex]["curve"] = "linear"
        elif case == CURVE_STEPPED:
            timeline[frameIndex]["curve"] = "stepped"
        elif case == CURVE_BEZIER:
            cx1 = self.readFloat()
            cy1 = self.readFloat()
            cx2 = self.readFloat()
            cy2 = self.readFloat()
            timeline[frameIndex]["curve"] = [cx1, cy1, cx2, cy2]
    
    def readInt(self, optimizePositive=None) -> int:
        # java native input.readInt()
        if optimizePositive is None:
            ch1 = self.read()
            ch2 = self.read()
            ch3 = self.read()
            ch4 = self.read()
            if ((ch1 | ch2 | ch3 | ch4) < 0):
                raise ValueError("((ch1 | ch2 | ch3 | ch4) is < 0")
            return ((ch1 << 24) + (ch2 << 16) + (ch3 << 8) + (ch4 << 0))
        b = self.read()
        result = b & 0x7F;
        if ((b & 0x80) != 0):
            b = self.read()
            result |= (b & 0x7F) << 7
            if ((b & 0x80) != 0):
                b = self.read()
                result |= (b & 0x7F) << 14
                if ((b & 0x80) != 0):
                    b = self.read()
                    result |= (b & 0x7F) << 21
                    if ((b & 0x80) != 0):
                        b = self.read()
                        result |= (b & 0x7F) << 28
        if result > 0xFFFFFFFF:
            raise OverflowError("not an int32")
        if result > 0x7FFFFFFF:
            result = int(0x100000000 - result)
            if result < 2147483648:
                result = -result
            else:
                result = -2147483648
        if optimizePositive is True:
            return result
        else:
            return ((result >> 1) ^ -(result & 1))

    def readString(self):
        chars = [None] * 32
        byteCount = self.readInt(True)
        if byteCount == 0:
            return None
        elif byteCount == 1:
            return ""
        byteCount -= 1
        if len(chars) < byteCount:
            chars = [None] * byteCount
        charCount = 0
        i = 0
        while (i < byteCount):
            b = self.read()
            shiftedB = b >> 4
            if shiftedB == -1:
                # 0b11110000 -> 0b11111111 ?
                raise ValueError("shiftedB is -1")
            elif shiftedB == 12 or shiftedB == 13:
                chars[charCount] = chr((b & 0x1F) << 6 | self.read() & 0x3F)
                charCount += 1
                i += 2
            elif shiftedB == 14:
                chars[charCount] = chr((b & 0x0F) << 12 | (self.read() & 0x3F) << 6 | self.read() & 0x3F)
                charCount += 1
                i += 3
            else:
                chars[charCount] = chr(b)
                charCount += 1
                i += 1
        string = ""
        for c in chars:
            if c is not None:
                string += c
        return string

    def readFloat(self):
        """
            IEEE 754
        """
        exponent_len = 8
        mantissa_len = 23
        bits = (self.read() << 24) | (self.read() << 16) | (self.read() << 8) | self.read()
        sign_raw = (bits & 0x80000000) >> (exponent_len + mantissa_len)
        exponent_raw = (bits & 0x7f800000) >> mantissa_len
        mantissa_raw = bits & 0x007fffff

        if sign_raw == 1:
            sign = -1
        else:
            sign = 1

        if exponent_raw == 2 ** exponent_len - 1:
            if mantissa_raw == 2 ** mantissa_len - 1:
                return float('nan')

            return sign * float('inf')  # Inf

        exponent = exponent_raw - (2 ** (exponent_len - 1) - 1)

        if exponent_raw == 0:
            mantissa = 0
        else:
            mantissa = 1

        for b in range(mantissa_len - 1, -1, -1):
            if mantissa_raw & (2 ** b):
                mantissa += 1 / (2 ** (mantissa_len - b))

        return sign * (2 ** exponent) * mantissa

    def readBoolean(self):
        b = self.read()
        if b < 0:
            raise ValueError("b is < 0")
        return b != 0

    def rgba8888ToColor(self, value):
        return hex(value)
    
    def rgba888ToColor(self, value):
        return hex(value & 0xffffff)

    def readShort(self):
        ch1 = self.read()
        ch2 = self.read()
        if ((ch1 | ch2) < 0):
            raise ValueError("(ch1 | ch2) < 0")
        return ((ch1 << 8) + (ch2 << 0))

    def readFloatArray(self, n, scale):
        array = [0.0] * n
        # ????
        if scale == 1:
            for i in range(n):
                array[i] = self.readFloat()
        else:
            for i in range(n):
                array[i] = self.readFloat() * scale
        return array
    
    def readShortArray(self):
        n = self.readInt(True)
        array = [0] * n
        for i in range(n):
            array[i] = self.readShort()
        return array

    def read(self) -> int:
        result = self.binaryData[self.index]
        self.index += 1
        return result
    