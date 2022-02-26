#!/usr/bin/env python3

try:
    from os import path
    import sys
    import inspect
    file_path = path.dirname(path.abspath(inspect.stack()[0][1]))

    from deezer import Deezer
    from deezer import TrackFormats

    from deemix import generateDownloadObject
    from deemix.settings import load as loadSettings
    from deemix.utils import getBitrateNumberFromText
    import deemix.utils.localpaths as localpaths
    from deemix.downloader import Downloader
    from deemix.itemgen import GenerationError
except ImportError as e:
    print(e)
    exit(1)


def printStdOut(text):
    sys.stdout.buffer.write((text+'\n').encode('utf-8'))


class LogListener:

    # opens files to write successful and failed downloads
    def __init__(self):
        self.failed = 0

    # deemix call this function for logging to cli
    def send(self, key, value=None):
        self.writetxt(key, value)

    # write whether a track downloaded or failed
    def writetxt(self, key, value=None):
        if key == "updateQueue":
            if value.get('downloaded'):
                filePath = path.abspath(value['downloadPath'])
                printStdOut(filePath)
            if value.get('failed'):
                self.failed += 1


class DLR():
    # protable:Bool - is the config folder in the current directory
    def __init__(self, portable=True):
        self.dz = Deezer()
        self.listener = LogListener()

        self.plugins = {}
        self.downloadObjects = []

        localpath = file_path

        self.configFolder = path.join(
            localpath, 'config') if portable else localpaths.getConfigFolder()
        self.settings = loadSettings(self.configFolder)

        self.arl = ''
        self.findarl()

    def requestValidArl(self, arl):
        # request an arl token until successful login
        while True:
            if self.dz.login_via_arl(arl):
                break
        return arl

    def findarl(self):
        # find arl in config folder or ask for it
        if (path.isfile(path.join(self.configFolder, '.arl'))):
            with open(path.join(self.configFolder, '.arl'), 'r') as f:
                arl = f.readline().rstrip("\n").strip()
            if not self.dz.login_via_arl(arl):
                arl = self.requestValidArl(arl)
        else:
            printStdOut(
                'Error, no arl file found. Please enter your arl inside the config folder. NO_ARL_FOUND')

    def addToQueue(self, links, bitrate=None):
        # turns deezer urls to DL objects stores them in class.downloadObjects
        # links: list - contains a list of deezer links
        # bitrate: TrackFormat - a trackformat from deezer.TrackFormats
        if not bitrate:
            bitrate = self.settings.get("maxBitrate", TrackFormats.MP3_320)

        for link in links:
            try:
                downloadObject = generateDownloadObject(
                    self.dz, link, bitrate, self.plugins, self.listener)
            except GenerationError as e:
                printStdOut(f"Error: {e.link}: {e.message}. GENERATION_ERROR")
                continue
            if isinstance(downloadObject, list):
                self.downloadObjects += downloadObject
            else:
                self.downloadObjects.append(downloadObject)

    # starts the download of all downloadObjects in queue then clears it once finished
    def getsongs(self):
        for obj in self.downloadObjects:
            Downloader(self.dz, obj, self.settings, self.listener).start()
        self.downloadObjects = []

    # reads in links from file or changes bitrate text to TrackFormat
        # url: list - can be a list of urls
        # bitrate: string - choice between
        # lossleess:['flac', 'lossless', '9']
        # mp3:['mp3', '320', '3'] ['128', '1']
        # 360:['360', '360_hq', '15'] ['360_mq', '14'] ['360_lq', '13']
        # filepath: string - the filepath to a txt file of urls
    def loadLinks(self, url=None, filepath=None, bitrate=None):

        links = []
        try:
            isfile = path.isfile(filepath)
        except Exception:
            isfile = False
        if isfile:
            with open(filepath) as f:
                links = f.readlines()
        else:
            if not isinstance(url, list):
                for link in url:
                    if ';' in link:
                        for l in link.split(";"):
                            links.append(l)
                    else:
                        links.append(link)
            else:
                links = url

        if bitrate:
            bitrate = getBitrateNumberFromText(bitrate)

        self.addToQueue(links, bitrate)

    def change(self, key, value):
        # change a settings value
        self.settings[key] = value

    def resetSetting(self):
        # reset settings to "default"
        self.settings = loadSettings(self.configFolder)

    def printSettings(self):
        # print current settings
        printStdOut("printing settings")
        for k, v in self.settings.items():
            printStdOut(f'{k}\n{v}\n\n')

    def songByName(self, name):
        return self.dz.api.search(name)['data'][0]['link']


def getBitrateAndRemoveArgs(args):
    # Go over args and find bitrate if any is given
    for arg in args:
        if arg in ['-flac']:
            args.remove(arg)
            return TrackFormats.FLAC
        if arg in ['-mp3', '-320']:
            args.remove(arg)
            return TrackFormats.MP3_320
        if arg in ['-128']:
            args.remove(arg)
            return TrackFormats.MP3_128
    # return default bitrate
    return TrackFormats.MP3_320


if __name__ == '__main__':
    dlr = DLR()

    args = sys.argv[1:]

    bitrate = str(getBitrateAndRemoveArgs(args))

    links = [dlr.songByName(name) for name in args]

    dlr.loadLinks(links, bitrate=bitrate)

    dlr.change('downloadLocation', 'handler/tmp')

    dlr.getsongs()
